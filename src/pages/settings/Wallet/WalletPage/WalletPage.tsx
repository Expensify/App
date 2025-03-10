import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import type {ForwardedRef, RefObject} from 'react';
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import KYCWall from '@components/KYCWall';
import type {PaymentMethodType, Source} from '@components/KYCWall/types';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Popover from '@components/Popover';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod, FormattedSelectedPaymentMethodIcon} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {maskCardNumber} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods, getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import variables from '@styles/variables';
import {deletePaymentBankAccount, openPersonalBankAccountSetupView, setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import {close as closeModal} from '@userActions/Modal';
import {clearWalletError, clearWalletTermsError, deletePaymentCard, makeDefaultPaymentMethod as makeDefaultPaymentMethodPaymentMethods, openWalletPage} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, Card} from '@src/types/onyx';

type WalletPageProps = {
    /** Listen for window resize event on web and desktop. */
    shouldListenForResize?: boolean;
};

function WalletPage({shouldListenForResize = false}: WalletPageProps) {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {initialValue: {}});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {initialValue: {}});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {initialValue: {}});
    const [isLoadingPaymentMethods] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, {initialValue: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {initialValue: {}});
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const network = useNetwork();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);
    const [shouldShowDefaultDeleteMenu, setShouldShowDefaultDeleteMenu] = useState(false);
    const [shouldShowCardMenu, setShouldShowCardMenu] = useState(false);
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(false);
    const addPaymentMethodAnchorRef = useRef(null);
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

    const hasWallet = !isEmpty(userWallet);
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const hasAssignedCard = !isEmpty(cardList);

    const isPendingOnfidoResult = userWallet?.isPendingOnfidoResult ?? false;
    const hasFailedOnfido = userWallet?.hasFailedOnfido ?? false;

    const updateShouldShowLoadingSpinner = useCallback(() => {
        // In order to prevent a loop, only update state of the spinner if there is a change
        const showLoadingSpinner = isLoadingPaymentMethods ?? false;
        if (showLoadingSpinner !== shouldShowLoadingSpinner) {
            setShouldShowLoadingSpinner(showLoadingSpinner && !network.isOffline);
        }
    }, [isLoadingPaymentMethods, network.isOffline, shouldShowLoadingSpinner]);

    const debounceSetShouldShowLoadingSpinner = debounce(updateShouldShowLoadingSpinner, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

    /**
     * Set position of the payment menu
     */
    const setMenuPosition = useCallback(() => {
        if (!paymentMethodButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(paymentMethodButtonRef.current);

        setAnchorPosition({
            anchorPositionTop: position.top + position.height - variables.bankAccountActionPopoverTopSpacing,
            // We want the position to be 23px to the right of the left border
            anchorPositionRight: windowWidth - position.right + variables.bankAccountActionPopoverRightSpacing,
            anchorPositionHorizontal: position.x + variables.addBankAccountLeftSpacing,
            anchorPositionVertical: position.y,
        });
    }, [windowWidth]);

    const getSelectedPaymentMethodID = useCallback(() => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            return paymentMethod.selectedPaymentMethod.bankAccountID;
        }
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return paymentMethod.selectedPaymentMethod.fundID;
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);

    /**
     * Display the delete/default menu, or the add payment method menu
     */
    const paymentMethodPressed = (
        nativeEvent?: GestureResponderEvent | KeyboardEvent,
        accountType?: string,
        account?: AccountData,
        icon?: FormattedSelectedPaymentMethodIcon,
        isDefault?: boolean,
        methodID?: string | number,
        description?: string,
    ) => {
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }

        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
        paymentMethodButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod = {
                title: '',
            };
            if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: account?.addressName ?? '',
                    icon,
                    description: description ?? getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: account?.addressName ?? '',
                    icon,
                    description: description ?? getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            setPaymentMethod({
                isSelectedPaymentMethodDefault: !!isDefault,
                selectedPaymentMethod: account ?? {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            });
            setShouldShowDefaultDeleteMenu(true);
            setMenuPosition();
            return;
        }
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        setShouldShowAddPaymentMenu(true);
        setMenuPosition();
    };

    const assignedCardPressed = (nativeEvent?: GestureResponderEvent | KeyboardEvent, cardData?: Card, icon?: FormattedSelectedPaymentMethodIcon, cardID?: number) => {
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }
        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }

        if (shouldShowCardMenu) {
            setShouldShowCardMenu(false);
            return;
        }
        paymentMethodButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;
        setPaymentMethod({
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: maskCardNumber(cardData?.cardName, cardData?.bank),
                description: cardData ? getDescriptionForPolicyDomainCard(cardData.domainName) : '',
                icon,
            },
            selectedPaymentMethodType: '',
            methodID: cardID ?? CONST.DEFAULT_NUMBER_ID,
        });
        setShouldShowCardMenu(true);
        setMenuPosition();
    };

    /**
     * Hide the add payment modal
     */
    const hideAddPaymentMenu = () => {
        setShouldShowAddPaymentMenu(false);
    };

    /**
     * Navigate to the appropriate payment type addition screen
     */
    const addPaymentMethodTypePressed = (paymentType: string) => {
        hideAddPaymentMenu();

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        if (paymentType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || paymentType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT) {
            openPersonalBankAccountSetupView();
            return;
        }

        throw new Error('Invalid payment method type selected');
    };

    /**
     * Hide the default / delete modal
     */
    const hideDefaultDeleteMenu = useCallback(() => {
        setShouldShowDefaultDeleteMenu(false);
        setShowConfirmDeleteModal(false);
    }, [setShouldShowDefaultDeleteMenu, setShowConfirmDeleteModal]);

    const hideCardMenu = useCallback(() => {
        setShouldShowCardMenu(false);
    }, [setShouldShowCardMenu]);

    const makeDefaultPaymentMethod = useCallback(() => {
        const paymentCardList = fundList ?? {};
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = formatPaymentMethods(bankAccountList ?? {}, paymentCardList, styles);

        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            makeDefaultPaymentMethodPaymentMethods(paymentMethod.selectedPaymentMethod.bankAccountID ?? CONST.DEFAULT_NUMBER_ID, 0, previousPaymentMethod, currentPaymentMethod);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            makeDefaultPaymentMethodPaymentMethods(0, paymentMethod.selectedPaymentMethod.fundID ?? CONST.DEFAULT_NUMBER_ID, previousPaymentMethod, currentPaymentMethod);
        }
    }, [
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        bankAccountList,
        fundList,
        styles,
    ]);

    const deletePaymentMethod = useCallback(() => {
        const bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        const fundID = paymentMethod.selectedPaymentMethod.fundID;
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && bankAccountID) {
            deletePaymentBankAccount(bankAccountID);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && fundID) {
            deletePaymentCard(fundID);
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);

    /**
     * Navigate to the appropriate page after completing the KYC flow, depending on what initiated it
     */
    const navigateToWalletOrTransferBalancePage = (source?: Source) => {
        Navigation.navigate(source === CONST.KYC_WALL_SOURCE.ENABLE_WALLET ? ROUTES.SETTINGS_WALLET : ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    useEffect(() => {
        // If the user was previously offline, skip debouncing showing the loader
        if (!network.isOffline) {
            updateShouldShowLoadingSpinner();
        } else {
            debounceSetShouldShowLoadingSpinner();
        }
    }, [network.isOffline, debounceSetShouldShowLoadingSpinner, updateShouldShowLoadingSpinner]);

    useEffect(() => {
        if (network.isOffline) {
            return;
        }
        openWalletPage();
    }, [network.isOffline]);

    useLayoutEffect(() => {
        if (!shouldListenForResize) {
            return;
        }
        const popoverPositionListener = Dimensions.addEventListener('change', () => {
            if (!shouldShowAddPaymentMenu && !shouldShowDefaultDeleteMenu && !shouldShowCardMenu) {
                return;
            }
            if (shouldShowAddPaymentMenu) {
                debounce(setMenuPosition, CONST.TIMING.RESIZE_DEBOUNCE_TIME)();
                return;
            }
            setMenuPosition();
        });
        return () => {
            if (!popoverPositionListener) {
                return;
            }
            popoverPositionListener.remove();
        };
    }, [shouldShowAddPaymentMenu, shouldShowDefaultDeleteMenu, shouldShowCardMenu, setMenuPosition, shouldListenForResize]);

    useEffect(() => {
        if (!shouldShowDefaultDeleteMenu) {
            return;
        }

        // We should reset selected payment method state values and close corresponding modals if the selected payment method is deleted
        let shouldResetPaymentMethodData = false;

        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && isEmpty(bankAccountList?.[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && isEmpty(fundList?.[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        }
        if (shouldResetPaymentMethodData) {
            // Close corresponding selected payment method modals which are open
            if (shouldShowDefaultDeleteMenu) {
                hideDefaultDeleteMenu();
            }
        }
    }, [hideDefaultDeleteMenu, paymentMethod.methodID, paymentMethod.selectedPaymentMethodType, bankAccountList, fundList, shouldShowDefaultDeleteMenu]);
    // Don't show "Make default payment method" button if it's the only payment method or if it's already the default
    const isCurrentPaymentMethodDefault = () => {
        const hasMultiplePaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles).length > 1;
        if (hasMultiplePaymentMethods) {
            if (paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                return paymentMethod.selectedPaymentMethod.bankAccountID === userWallet?.walletLinkedAccountID;
            }
            if (paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                return paymentMethod.selectedPaymentMethod.fundID === userWallet?.walletLinkedAccountID;
            }
        }
        return true;
    };

    const shouldShowMakeDefaultButton =
        !isCurrentPaymentMethodDefault() &&
        !(paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && paymentMethod.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);

    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || shouldUseNarrowLayout;
    const alertTextStyle = [styles.inlineSystemMessage, styles.flexShrink1];
    const alertViewStyle = [styles.flexRow, styles.alignItemsCenter, styles.w100];
    const headerWithBackButton = (
        <HeaderWithBackButton
            title={translate('common.wallet')}
            icon={Illustrations.MoneyIntoWallet}
            shouldUseHeadlineHeader
            shouldShowBackButton={shouldUseNarrowLayout}
            shouldDisplaySearchRouter
        />
    );

    if (isLoadingApp) {
        return (
            <ScreenWrapper
                testID={WalletPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                {headerWithBackButton}
                <View style={styles.flex1}>
                    <FullScreenLoadingIndicator />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <>
            <ScreenWrapper
                testID={WalletPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                {headerWithBackButton}
                <ScrollView style={styles.pt3}>
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <OfflineWithFeedback
                            style={styles.flex1}
                            contentContainerStyle={styles.flex1}
                            onClose={clearWalletError}
                            errors={userWallet?.errors}
                            errorRowStyles={[styles.ph6]}
                        >
                            <Section
                                subtitle={translate('walletPage.addBankAccountToSendAndReceive')}
                                title={translate('common.bankAccounts')}
                                isCentralPane
                                subtitleMuted
                                titleStyles={styles.accountSettingsSectionTitle}
                                illustration={LottieAnimations.BankVault}
                                illustrationStyle={styles.walletIllustration}
                                illustrationContainerStyle={{height: 220}}
                                illustrationBackgroundColor="#411103"
                            >
                                <PaymentMethodList
                                    shouldShowAddPaymentMethodButton={false}
                                    shouldShowEmptyListMessage={false}
                                    onPress={paymentMethodPressed}
                                    actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                                    activePaymentMethodID={shouldShowDefaultDeleteMenu ? getSelectedPaymentMethodID() : ''}
                                    buttonRef={addPaymentMethodAnchorRef}
                                    onListContentSizeChange={shouldShowAddPaymentMenu || shouldShowDefaultDeleteMenu ? setMenuPosition : () => {}}
                                    shouldEnableScroll={false}
                                    style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                                    listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                                />
                            </Section>

                            {hasAssignedCard ? (
                                <Section
                                    subtitle={translate('walletPage.assignedCardsDescription')}
                                    title={translate('walletPage.assignedCards')}
                                    isCentralPane
                                    subtitleMuted
                                    titleStyles={styles.accountSettingsSectionTitle}
                                >
                                    <PaymentMethodList
                                        shouldShowAddBankAccount={false}
                                        shouldShowAddPaymentMethodButton={false}
                                        shouldShowAssignedCards
                                        shouldShowEmptyListMessage={false}
                                        shouldEnableScroll={false}
                                        onPress={assignedCardPressed}
                                        style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                                        listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                                        actionPaymentMethodType={shouldShowCardMenu ? paymentMethod.selectedPaymentMethodType : ''}
                                        activePaymentMethodID={shouldShowCardMenu ? paymentMethod.methodID : ''}
                                        buttonRef={addPaymentMethodAnchorRef}
                                        onListContentSizeChange={shouldShowCardMenu ? setMenuPosition : () => {}}
                                    />
                                </Section>
                            ) : null}

                            {hasWallet && (
                                <Section
                                    subtitle={translate(`walletPage.sendAndReceiveMoney`)}
                                    title={translate('walletPage.expensifyWallet')}
                                    isCentralPane
                                    subtitleMuted
                                    titleStyles={styles.accountSettingsSectionTitle}
                                >
                                    <>
                                        {shouldShowLoadingSpinner ? (
                                            <ActivityIndicator
                                                color={theme.spinner}
                                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                                style={[styles.mt7, styles.mb5]}
                                            />
                                        ) : (
                                            <OfflineWithFeedback
                                                pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                                                errors={walletTerms?.errors}
                                                onClose={clearWalletTermsError}
                                                errorRowStyles={[styles.ml10, styles.mr2]}
                                                style={[styles.mt4, styles.mb2]}
                                            >
                                                <MenuItemWithTopDescription
                                                    description={translate('walletPage.balance')}
                                                    title={convertToDisplayString(userWallet?.currentBalance ?? 0)}
                                                    titleStyle={styles.textHeadlineH2}
                                                    interactive={false}
                                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                                />
                                            </OfflineWithFeedback>
                                        )}

                                        <KYCWall
                                            onSuccessfulKYC={(_iouPaymentType?: PaymentMethodType, source?: Source) => navigateToWalletOrTransferBalancePage(source)}
                                            onSelectPaymentMethod={(selectedPaymentMethod: string) => {
                                                if (hasActivatedWallet || selectedPaymentMethod !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                                                    return;
                                                }
                                                // To allow upgrading to a gold wallet, continue with the KYC flow after adding a bank account
                                                setPersonalBankAccountContinueKYCOnSuccess(ROUTES.SETTINGS_WALLET);
                                            }}
                                            enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                            addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                            addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                            source={hasActivatedWallet ? CONST.KYC_WALL_SOURCE.TRANSFER_BALANCE : CONST.KYC_WALL_SOURCE.ENABLE_WALLET}
                                            shouldIncludeDebitCard={hasActivatedWallet}
                                        >
                                            {(triggerKYCFlow: (event?: GestureResponderEvent | KeyboardEvent, iouPaymentType?: PaymentMethodType) => void, buttonRef: RefObject<View>) => {
                                                if (shouldShowLoadingSpinner) {
                                                    return null;
                                                }

                                                if (hasActivatedWallet) {
                                                    return (
                                                        <MenuItem
                                                            ref={buttonRef as ForwardedRef<View>}
                                                            title={translate('common.transferBalance')}
                                                            icon={Expensicons.Transfer}
                                                            onPress={triggerKYCFlow}
                                                            shouldShowRightIcon
                                                            disabled={network.isOffline}
                                                            wrapperStyle={[
                                                                styles.transferBalance,
                                                                shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                                                                shouldUseNarrowLayout ? styles.ph5 : styles.ph8,
                                                            ]}
                                                        />
                                                    );
                                                }

                                                if (isPendingOnfidoResult) {
                                                    return (
                                                        <View style={alertViewStyle}>
                                                            <Icon
                                                                src={Expensicons.Hourglass}
                                                                fill={theme.icon}
                                                            />

                                                            <Text style={alertTextStyle}>{translate('walletPage.walletActivationPending')}</Text>
                                                        </View>
                                                    );
                                                }

                                                if (hasFailedOnfido) {
                                                    return (
                                                        <View style={alertViewStyle}>
                                                            <Icon
                                                                src={Expensicons.Exclamation}
                                                                fill={theme.icon}
                                                            />

                                                            <Text style={alertTextStyle}>{translate('walletPage.walletActivationFailed')}</Text>
                                                        </View>
                                                    );
                                                }

                                                return (
                                                    <MenuItem
                                                        title={translate('walletPage.enableWallet')}
                                                        icon={Expensicons.Wallet}
                                                        ref={buttonRef as ForwardedRef<View>}
                                                        onPress={() => {
                                                            if (isActingAsDelegate) {
                                                                setIsNoDelegateAccessMenuVisible(true);
                                                                return;
                                                            }

                                                            if (!isUserValidated) {
                                                                Navigation.navigate(ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT.getRoute(ROUTES.SETTINGS_WALLET, ROUTES.SETTINGS_ENABLE_PAYMENTS));
                                                                return;
                                                            }
                                                            Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS);
                                                        }}
                                                        disabled={network.isOffline}
                                                        wrapperStyle={[
                                                            styles.transferBalance,
                                                            shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                                                            shouldUseNarrowLayout ? styles.ph5 : styles.ph8,
                                                        ]}
                                                    />
                                                );
                                            }}
                                        </KYCWall>
                                    </>
                                </Section>
                            )}
                        </OfflineWithFeedback>
                    </View>
                </ScrollView>
                <Popover
                    isVisible={shouldShowDefaultDeleteMenu}
                    onClose={hideDefaultDeleteMenu}
                    anchorPosition={{
                        top: anchorPosition.anchorPositionTop,
                        right: anchorPosition.anchorPositionRight,
                    }}
                    anchorRef={paymentMethodButtonRef as RefObject<View>}
                >
                    {!showConfirmDeleteModal && (
                        <View style={[styles.mv5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}>
                            {isPopoverBottomMount && (
                                <MenuItem
                                    title={paymentMethod.formattedSelectedPaymentMethod.title}
                                    icon={paymentMethod.formattedSelectedPaymentMethod.icon?.icon}
                                    iconHeight={paymentMethod.formattedSelectedPaymentMethod.icon?.iconHeight ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                    iconWidth={paymentMethod.formattedSelectedPaymentMethod.icon?.iconWidth ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                    iconStyles={paymentMethod.formattedSelectedPaymentMethod.icon?.iconStyles}
                                    description={paymentMethod.formattedSelectedPaymentMethod.description}
                                    wrapperStyle={[styles.mb4, styles.ph5, styles.pv0]}
                                    interactive={false}
                                    displayInDefaultIconColor
                                />
                            )}
                            {shouldShowMakeDefaultButton && (
                                <MenuItem
                                    title={translate('walletPage.setDefaultConfirmation')}
                                    icon={Expensicons.Star}
                                    onPress={() => {
                                        if (isActingAsDelegate) {
                                            closeModal(() => {
                                                setIsNoDelegateAccessMenuVisible(true);
                                            });
                                            return;
                                        }
                                        makeDefaultPaymentMethod();
                                        setShouldShowDefaultDeleteMenu(false);
                                    }}
                                    wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                                />
                            )}
                            <MenuItem
                                title={translate('common.delete')}
                                icon={Expensicons.Trashcan}
                                onPress={() => {
                                    if (isActingAsDelegate) {
                                        closeModal(() => {
                                            setIsNoDelegateAccessMenuVisible(true);
                                        });
                                        return;
                                    }
                                    closeModal(() => setShowConfirmDeleteModal(true));
                                }}
                                wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                            />
                        </View>
                    )}
                </Popover>
                <Popover
                    isVisible={shouldShowCardMenu}
                    onClose={hideCardMenu}
                    anchorPosition={{
                        top: anchorPosition.anchorPositionTop,
                        right: anchorPosition.anchorPositionRight,
                    }}
                    anchorRef={paymentMethodButtonRef as RefObject<View>}
                >
                    <View style={[styles.mv5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}>
                        {isPopoverBottomMount && (
                            <MenuItem
                                title={paymentMethod.formattedSelectedPaymentMethod.title}
                                icon={paymentMethod.formattedSelectedPaymentMethod.icon?.icon}
                                iconHeight={paymentMethod.formattedSelectedPaymentMethod.icon?.iconHeight ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                iconWidth={paymentMethod.formattedSelectedPaymentMethod.icon?.iconWidth ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                iconStyles={paymentMethod.formattedSelectedPaymentMethod.icon?.iconStyles}
                                description={paymentMethod.formattedSelectedPaymentMethod.description}
                                wrapperStyle={[styles.mb4, styles.ph5, styles.pv0]}
                                interactive={false}
                                displayInDefaultIconColor
                            />
                        )}
                        <MenuItem
                            icon={Expensicons.MoneySearch}
                            title={translate('workspace.common.viewTransactions')}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.SEARCH_ROOT.getRoute({
                                        query: buildCannedSearchQuery({
                                            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                                            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                                            cardID: String(paymentMethod.methodID),
                                        }),
                                    }),
                                );
                            }}
                        />
                    </View>
                </Popover>
                <ConfirmModal
                    isVisible={showConfirmDeleteModal}
                    onConfirm={() => {
                        hideDefaultDeleteMenu();
                        deletePaymentMethod();
                    }}
                    onCancel={hideDefaultDeleteMenu}
                    title={translate('walletPage.deleteAccount')}
                    prompt={translate('walletPage.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    shouldShowCancelButton
                    danger
                    onModalHide={resetSelectedPaymentMethodData}
                />
            </ScreenWrapper>
            <AddPaymentMethodMenu
                isVisible={shouldShowAddPaymentMenu}
                onClose={hideAddPaymentMenu}
                anchorPosition={{
                    horizontal: anchorPosition.anchorPositionHorizontal,
                    vertical: anchorPosition.anchorPositionVertical - CONST.MODAL.POPOVER_MENU_PADDING,
                }}
                onItemSelected={(method: string) => addPaymentMethodTypePressed(method)}
                anchorRef={addPaymentMethodAnchorRef}
                shouldShowPersonalBankAccountOption
            />
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </>
    );
}

WalletPage.displayName = 'WalletPage';

export default WalletPage;
