import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import type {ForwardedRef, RefObject} from 'react';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import KYCWall from '@components/KYCWall';
import type {PaymentMethodType, Source} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod} from '@hooks/usePaymentMethodState/types';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {maskCardNumber} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods, getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import {deletePaymentBankAccount, openPersonalBankAccountSetupView, setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import {close as closeModal} from '@userActions/Modal';
import {clearWalletError, clearWalletTermsError, deletePaymentCard, getPaymentMethods, makeDefaultPaymentMethod as makeDefaultPaymentMethodPaymentMethods} from '@userActions/PaymentMethods';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {CardPressHandlerParams, PaymentMethodPressHandlerParams} from './types';

const fundListSelector = (allFunds: OnyxEntry<OnyxTypes.FundList>) =>
    Object.fromEntries(Object.entries(allFunds ?? {}).filter(([, item]) => item.accountData?.additionalData?.isP2PDebitCard === true));

function WalletPage() {
    const [bankAccountList = getEmptyObject<OnyxTypes.BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardList = getEmptyObject<OnyxTypes.CardList>()] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [fundList = getEmptyObject<OnyxTypes.FundList>()] = useOnyx(ONYXKEYS.FUND_LIST, {
        canBeMissing: true,
        selector: fundListSelector,
    });
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [walletTerms = getEmptyObject<OnyxTypes.WalletTerms>()] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const [userAccount] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [lastUsedPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const isUserValidated = userAccount?.validated ?? false;
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const {isBetaEnabled} = usePermissions();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MoneySearch'] as const);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const network = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(false);
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
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
     * Display the delete/default menu, or the add payment method menu
     */
    const paymentMethodPressed = ({event, accountData, accountType, methodID, isDefault, icon, description}: PaymentMethodPressHandlerParams) => {
        paymentMethodButtonRef.current = event?.currentTarget as HTMLDivElement;

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod = {
                title: '',
            };
            if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: accountData?.addressName ?? '',
                    icon,
                    description: description ?? getPaymentMethodDescription(accountType, accountData),
                    type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: accountData?.addressName ?? '',
                    icon,
                    description: description ?? getPaymentMethodDescription(accountType, accountData),
                    type: CONST.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            setPaymentMethod({
                isSelectedPaymentMethodDefault: !!isDefault,
                selectedPaymentMethod: accountData ?? {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            });
        }
    };

    const onBankAccountRowPressed = ({accountData}: PaymentMethodPressHandlerParams) => {
        const accountPolicyID = accountData?.additionalData?.policyID;

        if (accountPolicyID) {
            if (isAccountLocked) {
                showLockedAccountModal();
                return;
            }
            navigateToBankAccountRoute(accountPolicyID, ROUTES.SETTINGS_WALLET);
        }
    };

    const assignedCardPressed = ({event, cardData, icon, cardID}: CardPressHandlerParams) => {
        paymentMethodButtonRef.current = event?.currentTarget as HTMLDivElement;
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
    };

    const addBankAccountPressed = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        openPersonalBankAccountSetupView({});
    };

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
        resetSelectedPaymentMethodData();
    }, [
        fundList,
        bankAccountList,
        styles,
        paymentMethod.selectedPaymentMethodType,
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        resetSelectedPaymentMethodData,
    ]);

    const deletePaymentMethod = useCallback(() => {
        const bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        const fundID = paymentMethod.selectedPaymentMethod.fundID;
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && bankAccountID) {
            const bankAccount = bankAccountList?.[paymentMethod.methodID] ?? {};
            deletePaymentBankAccount(bankAccountID, lastUsedPaymentMethods, bankAccount);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && fundID) {
            deletePaymentCard(fundID);
        }
        setShowConfirmDeleteModal(false);
        resetSelectedPaymentMethodData();
    }, [
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        paymentMethod.methodID,
        resetSelectedPaymentMethodData,
        bankAccountList,
        lastUsedPaymentMethods,
    ]);

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
        getPaymentMethods(true);
    }, [network.isOffline]);

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

    const shouldShowEnableGlobalReimbursementsButton =
        isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND) &&
        paymentMethod.selectedPaymentMethod?.additionalData?.currency === CONST.CURRENCY.USD &&
        paymentMethod.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
        !paymentMethod.selectedPaymentMethod?.additionalData?.corpay?.achAuthorizationForm;

    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const alertTextStyle = [styles.inlineSystemMessage, styles.flexShrink1];
    const alertViewStyle = [styles.flexRow, styles.alignItemsCenter, styles.w100];
    const headerWithBackButton = (
        <HeaderWithBackButton
            title={translate('common.wallet')}
            icon={Illustrations.MoneyIntoWallet}
            shouldUseHeadlineHeader
            shouldShowBackButton={shouldUseNarrowLayout}
            shouldDisplaySearchRouter
            onBackButtonPress={Navigation.popToSidebar}
        />
    );

    const bottomMountItem = useMemo(
        () => ({
            text: paymentMethod.formattedSelectedPaymentMethod.title,
            icon: paymentMethod.formattedSelectedPaymentMethod.icon?.icon,
            iconHeight: paymentMethod.formattedSelectedPaymentMethod.icon?.iconHeight ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize,
            iconWidth: paymentMethod.formattedSelectedPaymentMethod.icon?.iconWidth ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize,
            iconStyles: paymentMethod.formattedSelectedPaymentMethod.icon?.iconStyles,
            description: paymentMethod.formattedSelectedPaymentMethod.description,
            wrapperStyle: [styles.mb4, styles.ph5, styles.pt3],
            interactive: false,
            displayInDefaultIconColor: true,
        }),
        [paymentMethod.formattedSelectedPaymentMethod, styles.mb4, styles.ph5, styles.pt3],
    );

    const threeDotMenuItems = useMemo(
        () => [
            ...(shouldUseNarrowLayout ? [bottomMountItem] : []),
            ...(shouldShowMakeDefaultButton
                ? [
                      {
                          text: translate('walletPage.setDefaultConfirmation'),
                          icon: Expensicons.Star,
                          onSelected: () => {
                              if (isAccountLocked) {
                                  closeModal(() => showLockedAccountModal());
                                  return;
                              }
                              makeDefaultPaymentMethod();
                          },
                          numberOfLinesTitle: 0,
                      },
                  ]
                : []),
            {
                text: translate('common.delete'),
                icon: Expensicons.Trashcan,
                onSelected: () => {
                    if (isAccountLocked) {
                        closeModal(() => showLockedAccountModal());
                        return;
                    }
                    closeModal(() => setShowConfirmDeleteModal(true));
                },
            },
            ...(shouldShowEnableGlobalReimbursementsButton
                ? [
                      {
                          text: translate('common.enableGlobalReimbursements'),
                          icon: Expensicons.Globe,
                          onSelected: () => {
                              if (isAccountLocked) {
                                  closeModal(() => showLockedAccountModal());
                                  return;
                              }
                              closeModal(() => Navigation.navigate(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS.getRoute(paymentMethod.selectedPaymentMethod.bankAccountID)));
                          },
                      },
                  ]
                : []),
        ],
        [
            shouldUseNarrowLayout,
            bottomMountItem,
            shouldShowMakeDefaultButton,
            translate,
            shouldShowEnableGlobalReimbursementsButton,
            isAccountLocked,
            makeDefaultPaymentMethod,
            showLockedAccountModal,
            paymentMethod.selectedPaymentMethod.bankAccountID,
        ],
    );

    const cardThreeDotsMenuItems = useMemo(
        () => [
            ...(shouldUseNarrowLayout ? [bottomMountItem] : []),
            {
                text: translate('workspace.common.viewTransactions'),
                icon: expensifyIcons.MoneySearch,
                onSelected: () => {
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query: buildCannedSearchQuery({
                                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                                cardID: String(paymentMethod.methodID),
                            }),
                        }),
                    );
                },
            },
        ],
        [bottomMountItem, paymentMethod.methodID, shouldUseNarrowLayout, translate],
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
                        errorRowStyles={styles.ph6}
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
                                onPress={onBankAccountRowPressed}
                                onAddBankAccountPress={addBankAccountPressed}
                                onThreeDotsMenuPress={paymentMethodPressed}
                                style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                                shouldShowBankAccountSections
                                threeDotsMenuItems={threeDotMenuItems}
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
                                    shouldShowAssignedCards
                                    onPress={assignedCardPressed}
                                    threeDotsMenuItems={cardThreeDotsMenuItems}
                                    style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                                    listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
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
                                childrenStyles={shouldShowLoadingSpinner ? styles.mt7 : styles.mt5}
                            >
                                <>
                                    {shouldShowLoadingSpinner && (
                                        <ActivityIndicator
                                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                            style={[styles.mb5]}
                                        />
                                    )}
                                    {!shouldShowLoadingSpinner && hasActivatedWallet && (
                                        <OfflineWithFeedback
                                            pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                                            errors={walletTerms?.errors}
                                            onClose={clearWalletTermsError}
                                            errorRowStyles={[styles.ml10, styles.mr2]}
                                            style={[styles.mb2]}
                                        >
                                            <MenuItemWithTopDescription
                                                description={translate('walletPage.balance')}
                                                title={convertToDisplayString(userWallet?.currentBalance ?? 0)}
                                                titleStyle={styles.textHeadlineH2}
                                                interactive={false}
                                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                                copyValue={convertToDisplayString(userWallet?.currentBalance ?? 0)}
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
                                        addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                        source={hasActivatedWallet ? CONST.KYC_WALL_SOURCE.TRANSFER_BALANCE : CONST.KYC_WALL_SOURCE.ENABLE_WALLET}
                                        shouldIncludeDebitCard={hasActivatedWallet}
                                    >
                                        {(triggerKYCFlow, buttonRef: RefObject<View | null>) => {
                                            if (shouldShowLoadingSpinner) {
                                                return null;
                                            }

                                            if (hasActivatedWallet) {
                                                return (
                                                    <MenuItem
                                                        ref={buttonRef as ForwardedRef<View>}
                                                        title={translate('common.transferBalance')}
                                                        icon={Expensicons.Transfer}
                                                        onPress={(event) => {
                                                            triggerKYCFlow({event});
                                                        }}
                                                        shouldShowRightIcon
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
                                                        if (isAccountLocked) {
                                                            showLockedAccountModal();
                                                            return;
                                                        }

                                                        if (!isUserValidated) {
                                                            Navigation.navigate(ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT);
                                                            return;
                                                        }
                                                        Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS);
                                                    }}
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
            <ConfirmModal
                isVisible={showConfirmDeleteModal}
                onConfirm={deletePaymentMethod}
                onCancel={() => setShowConfirmDeleteModal(false)}
                title={translate('walletPage.deleteAccount')}
                prompt={translate('walletPage.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                shouldShowCancelButton
                danger
                onModalHide={resetSelectedPaymentMethodData}
            />
        </ScreenWrapper>
    );
}

WalletPage.displayName = 'WalletPage';

export default WalletPage;
