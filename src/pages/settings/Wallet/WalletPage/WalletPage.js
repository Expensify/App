import React, {useCallback, useEffect, useState, useRef} from 'react';
import {ActivityIndicator, View, InteractionManager, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PaymentMethodList from '../PaymentMethodList';
import ROUTES from '../../../../ROUTES';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation, {navigationRef} from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import compose from '../../../../libs/compose';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import Popover from '../../../../components/Popover';
import MenuItem from '../../../../components/MenuItem';
import * as PaymentMethods from '../../../../libs/actions/PaymentMethods';
import getClickedTargetLocation from '../../../../libs/getClickedTargetLocation';
import CurrentWalletBalance from '../../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../../ONYXKEYS';
import Permissions from '../../../../libs/Permissions';
import AddPaymentMethodMenu from '../../../../components/AddPaymentMethodMenu';
import CONST from '../../../../CONST';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import KYCWall from '../../../../components/KYCWall';
import {propTypes, defaultProps} from './walletPagePropTypes';
import {withNetwork} from '../../../../components/OnyxProvider';
import * as PaymentUtils from '../../../../libs/PaymentUtils';
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import ConfirmContent from '../../../../components/ConfirmContent';
import Button from '../../../../components/Button';
import themeColors from '../../../../styles/themes/default';
import variables from '../../../../styles/variables';
import useLocalize from '../../../../hooks/useLocalize';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import WalletEmptyState from '../WalletEmptyState';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import WalletSection from '../../../../components/WalletSection';

function WalletPage({bankAccountList, betas, cardList, fundList, isLoadingPaymentMethods, network, shouldListenForResize, userWallet, walletTerms}) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);
    const [shouldShowDefaultDeleteMenu, setShouldShowDefaultDeleteMenu] = useState(false);
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState({
        isSelectedPaymentMethodDefault: false,
        selectedPaymentMethod: {},
        formattedSelectedPaymentMethod: {
            title: '',
        },
        methodID: null,
        selectedPaymentMethodType: null,
    });
    const addPaymentMethodAnchorRef = useRef(null);
    const paymentMethodButtonRef = useRef(null);
    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });
    const [showConfirmDeleteContent, setShowConfirmDeleteContent] = useState(false);

    const hasBankAccount = !_.isEmpty(bankAccountList) || !_.isEmpty(fundList);
    const hasWallet = userWallet.walletLinkedAccountID > 0;
    const hasAssignedCard = !_.isEmpty(cardList);
    const shouldShowEmptyState = !hasBankAccount && !hasWallet && !hasAssignedCard;

    const updateShouldShowLoadingSpinner = useCallback(() => {
        // In order to prevent a loop, only update state of the spinner if there is a change
        const showLoadingSpinner = isLoadingPaymentMethods || false;
        if (showLoadingSpinner !== shouldShowLoadingSpinner) {
            setShouldShowLoadingSpinner(isLoadingPaymentMethods && !network.isOffline);
        }
    }, [isLoadingPaymentMethods, network.isOffline, shouldShowLoadingSpinner]);

    const debounceSetShouldShowLoadingSpinner = _.debounce(updateShouldShowLoadingSpinner, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

    /**
     * Set position of the payment menu
     *
     * @param {Object} position
     */
    const setMenuPosition = useCallback(() => {
        if (!paymentMethodButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(paymentMethodButtonRef.current);

        setAnchorPosition({
            anchorPositionTop: position.top + position.height + variables.addPaymentPopoverTopSpacing,
            // We want the position to be 23px to the right of the left border
            anchorPositionRight: windowWidth - position.right - variables.addBankAccountLeftSpacing,
            anchorPositionHorizontal: position.x + (shouldShowEmptyState ? -variables.addPaymentMethodLeftSpacing : variables.addBankAccountLeftSpacing),
            anchorPositionVertical: position.y,
        });
    }, [shouldShowEmptyState, windowWidth]);

    const getSelectedPaymentMethodID = useCallback(() => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            return paymentMethod.selectedPaymentMethod.bankAccountID;
        }
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return paymentMethod.selectedPaymentMethod.fundID;
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);

    const resetSelectedPaymentMethodData = useCallback(() => {
        // Reset to same values as in the constructor
        setPaymentMethod({
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: '',
            },
            methodID: null,
            selectedPaymentMethodType: null,
        });
    }, [setPaymentMethod]);

    /**
     * Display the delete/default menu, or the add payment method menu
     *
     * @param {Object} nativeEvent
     * @param {String} accountType
     * @param {String} account
     * @param {Boolean} isDefault
     * @param {String|Number} methodID
     */
    const paymentMethodPressed = (nativeEvent, accountType, account, isDefault, methodID) => {
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }

        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }

        paymentMethodButtonRef.current = nativeEvent.currentTarget;

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod;
            if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: PaymentUtils.getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: PaymentUtils.getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            setPaymentMethod({
                isSelectedPaymentMethodDefault: isDefault,
                selectedPaymentMethod: account,
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID,
            });
            setShouldShowDefaultDeleteMenu(true);
            setMenuPosition();
            return;
        }
        setShouldShowAddPaymentMenu(true);
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
     *
     * @param {String} paymentType
     */
    const addPaymentMethodTypePressed = (paymentType) => {
        hideAddPaymentMenu();

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            BankAccounts.openPersonalBankAccountSetupView();
            return;
        }

        throw new Error('Invalid payment method type selected');
    };

    /**
     * Hide the default / delete modal
     * @param {boolean} shouldClearSelectedData - Clear selected payment method data if true
     */
    const hideDefaultDeleteMenu = useCallback(() => {
        setShouldShowDefaultDeleteMenu(false);
        InteractionManager.runAfterInteractions(() => {
            setShowConfirmDeleteContent(false);
        });
    }, [setShouldShowDefaultDeleteMenu, setShowConfirmDeleteContent]);

    const makeDefaultPaymentMethod = useCallback(() => {
        const paymentCardList = fundList || {};
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList, paymentCardList);

        const previousPaymentMethod = _.find(paymentMethods, (method) => method.isDefault);
        const currentPaymentMethod = _.find(paymentMethods, (method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            PaymentMethods.makeDefaultPaymentMethod(paymentMethod.selectedPaymentMethod.bankAccountID, null, previousPaymentMethod, currentPaymentMethod);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.makeDefaultPaymentMethod(null, paymentMethod.selectedPaymentMethod.fundID, previousPaymentMethod, currentPaymentMethod);
        }
    }, [
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        bankAccountList,
        fundList,
    ]);

    const deletePaymentMethod = useCallback(() => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            BankAccounts.deletePaymentBankAccount(paymentMethod.selectedPaymentMethod.bankAccountID);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.deletePaymentCard(paymentMethod.selectedPaymentMethod.fundID);
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);

    const navigateToTransferBalancePage = () => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    useEffect(() => {
        PaymentMethods.openWalletPage();
    }, []);

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
        PaymentMethods.openWalletPage();
    }, [network.isOffline]);

    useEffect(() => {
        if (!shouldListenForResize) {
            return;
        }
        setMenuPosition();
    }, [shouldListenForResize, setMenuPosition]);

    useEffect(() => {
        if (!shouldShowDefaultDeleteMenu) {
            return;
        }

        // We should reset selected payment method state values and close corresponding modals if the selected payment method is deleted
        let shouldResetPaymentMethodData = false;

        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT && _.isEmpty(bankAccountList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && _.isEmpty(fundList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        }
        if (shouldResetPaymentMethodData) {
            // Close corresponding selected payment method modals which are open
            if (shouldShowDefaultDeleteMenu) {
                hideDefaultDeleteMenu();
            }
        }
    }, [hideDefaultDeleteMenu, paymentMethod.methodID, paymentMethod.selectedPaymentMethodType, bankAccountList, fundList, shouldShowDefaultDeleteMenu]);

    useEffect(() => {
        if (!shouldShowEmptyState) {
            return;
        }
        navigationRef.setParams({backgroundColor: themeColors.walletPageBG});
    }, [shouldShowEmptyState]);

    const shouldShowMakeDefaultButton =
        !paymentMethod.isSelectedPaymentMethodDefault &&
        Permissions.canUseWallet(betas) &&
        !(paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT && paymentMethod.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);

    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || isSmallScreenWidth;

    return (
        <>
            {shouldShowEmptyState ? (
                <WalletEmptyState onAddPaymentMethod={paymentMethodPressed} />
            ) : (
                <ScreenWrapper testID={WalletPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('common.wallet')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                    />
                    <View style={[styles.flex1, styles.mb4]}>
                        <ScrollView>
                            <OfflineWithFeedback
                                style={styles.flex1}
                                contentContainerStyle={styles.flex1}
                                onClose={PaymentMethods.clearWalletError}
                                errors={userWallet.errors}
                                errorRowStyles={[styles.ph6]}
                            >
                                {hasWallet && (
                                    <WalletSection
                                        icon={Illustrations.MoneyIntoWallet}
                                        subtitle={translate('walletPage.sendAndReceiveMoney')}
                                        title={translate('walletPage.expensifyWallet')}
                                    >
                                        <>
                                            {shouldShowLoadingSpinner ? (
                                                <ActivityIndicator
                                                    color={themeColors.spinner}
                                                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                                    style={[styles.mt7, styles.mb5]}
                                                />
                                            ) : (
                                                <OfflineWithFeedback
                                                    pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                                                    errors={walletTerms.errors}
                                                    onClose={PaymentMethods.clearWalletTermsError}
                                                    errorRowStyles={[styles.ml10, styles.mr2]}
                                                    style={[styles.mt7, styles.mb5]}
                                                >
                                                    <CurrentWalletBalance balanceStyles={[styles.walletBalance]} />
                                                </OfflineWithFeedback>
                                            )}
                                            <KYCWall
                                                onSuccessfulKYC={navigateToTransferBalancePage}
                                                enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                                addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                                popoverPlacement="bottom"
                                            >
                                                {(triggerKYCFlow, buttonRef) => (
                                                    <MenuItem
                                                        ref={buttonRef}
                                                        title={translate('common.transferBalance')}
                                                        icon={Expensicons.Transfer}
                                                        onPress={triggerKYCFlow}
                                                        shouldShowRightIcon
                                                        disabled={network.isOffline}
                                                        wrapperStyle={styles.transferBalance}
                                                    />
                                                )}
                                            </KYCWall>
                                        </>
                                    </WalletSection>
                                )}
                                {hasAssignedCard ? (
                                    <WalletSection
                                        icon={Illustrations.CreditCardsNew}
                                        subtitle={translate('walletPage.assignedCardsDescription')}
                                        title={translate('walletPage.assignedCards')}
                                    >
                                        <PaymentMethodList
                                            shouldShowAddBankAccount={false}
                                            shouldShowAddPaymentMethodButton={false}
                                            shouldShowAssignedCards
                                            shouldShowEmptyListMessage={false}
                                            onPress={paymentMethodPressed}
                                            style={styles.mt5}
                                            isAddPaymentMenuActive={shouldShowAddPaymentMenu}
                                            actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                                            activePaymentMethodID={shouldShowDefaultDeleteMenu ? getSelectedPaymentMethodID() : ''}
                                            buttonRef={addPaymentMethodAnchorRef}
                                            onListContentSizeChange={shouldShowAddPaymentMenu || shouldShowDefaultDeleteMenu ? setMenuPosition : () => {}}
                                        />
                                    </WalletSection>
                                ) : null}
                                <WalletSection
                                    icon={Illustrations.BankArrow}
                                    subtitle={translate('walletPage.addBankAccountToSendAndReceive')}
                                    title={translate('walletPage.bankAccounts')}
                                >
                                    <PaymentMethodList
                                        shouldShowAddPaymentMethodButton={false}
                                        shouldShowEmptyListMessage={false}
                                        onPress={paymentMethodPressed}
                                        isAddPaymentMenuActive={shouldShowAddPaymentMenu}
                                        actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                                        activePaymentMethodID={shouldShowDefaultDeleteMenu ? getSelectedPaymentMethodID() : ''}
                                        buttonRef={addPaymentMethodAnchorRef}
                                        onListContentSizeChange={shouldShowAddPaymentMenu || shouldShowDefaultDeleteMenu ? setMenuPosition : () => {}}
                                        shouldEnableScroll={false}
                                        style={styles.mt5}
                                    />
                                </WalletSection>
                            </OfflineWithFeedback>
                        </ScrollView>
                    </View>
                    <Popover
                        isVisible={shouldShowDefaultDeleteMenu}
                        onClose={hideDefaultDeleteMenu}
                        anchorPosition={{
                            top: anchorPosition.anchorPositionTop,
                            right: anchorPosition.anchorPositionRight,
                        }}
                        withoutOverlay
                        anchorRef={paymentMethodButtonRef}
                        onModalHide={resetSelectedPaymentMethodData}
                    >
                        {!showConfirmDeleteContent ? (
                            <View style={[styles.m5, !isSmallScreenWidth ? styles.sidebarPopover : '']}>
                                {isPopoverBottomMount && (
                                    <MenuItem
                                        title={paymentMethod.formattedSelectedPaymentMethod.title || ''}
                                        icon={paymentMethod.formattedSelectedPaymentMethod.icon}
                                        description={paymentMethod.formattedSelectedPaymentMethod.description}
                                        wrapperStyle={[styles.pv0, styles.ph0, styles.mb4]}
                                        interactive={false}
                                    />
                                )}
                                {shouldShowMakeDefaultButton && (
                                    <Button
                                        onPress={() => {
                                            makeDefaultPaymentMethod();
                                            setShouldShowDefaultDeleteMenu(false);
                                        }}
                                        text={translate('walletPage.setDefaultConfirmation')}
                                    />
                                )}
                                <Button
                                    onPress={() => {
                                        setShowConfirmDeleteContent(true);
                                    }}
                                    style={[shouldShowMakeDefaultButton ? styles.mt4 : {}]}
                                    text={translate('common.delete')}
                                    danger
                                />
                            </View>
                        ) : (
                            <ConfirmContent
                                onConfirm={() => {
                                    deletePaymentMethod();
                                    hideDefaultDeleteMenu();
                                }}
                                onCancel={hideDefaultDeleteMenu}
                                contentStyles={!isSmallScreenWidth ? [styles.sidebarPopover, styles.willChangeTransform] : undefined}
                                title={translate('walletPage.deleteAccount')}
                                prompt={translate('walletPage.deleteConfirmation')}
                                confirmText={translate('common.delete')}
                                cancelText={translate('common.cancel')}
                                anchorPosition={{
                                    top: anchorPosition.anchorPositionTop,
                                    right: anchorPosition.anchorPositionRight,
                                }}
                                shouldShowCancelButton
                                danger
                            />
                        )}
                    </Popover>
                </ScreenWrapper>
            )}
            <AddPaymentMethodMenu
                isVisible={shouldShowAddPaymentMenu}
                onClose={hideAddPaymentMenu}
                anchorPosition={{
                    horizontal: anchorPosition.anchorPositionHorizontal,
                    vertical: anchorPosition.anchorPositionVertical - CONST.MODAL.POPOVER_MENU_PADDING,
                }}
                onItemSelected={(method) => addPaymentMethodTypePressed(method)}
                anchorRef={addPaymentMethodAnchorRef}
            />
        </>
    );
}

WalletPage.propTypes = propTypes;
WalletPage.defaultProps = defaultProps;
WalletPage.displayName = 'WalletPage';

export default compose(
    withNetwork(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        fundList: {
            key: ONYXKEYS.FUND_LIST,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
        },
    }),
)(WalletPage);
