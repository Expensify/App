import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View, InteractionManager} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PaymentMethodList from '../PaymentMethodList';
import ROUTES from '../../../../ROUTES';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import compose from '../../../../libs/compose';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import Popover from '../../../../components/Popover';
import MenuItem from '../../../../components/MenuItem';
import Text from '../../../../components/Text';
import * as PaymentMethods from '../../../../libs/actions/PaymentMethods';
import getClickedTargetLocation from '../../../../libs/getClickedTargetLocation';
import CurrentWalletBalance from '../../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../../ONYXKEYS';
import Permissions from '../../../../libs/Permissions';
import AddPaymentMethodMenu from '../../../../components/AddPaymentMethodMenu';
import CONST from '../../../../CONST';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import KYCWall from '../../../../components/KYCWall';
import {propTypes, defaultProps} from './paymentsPagePropTypes';
import {withNetwork} from '../../../../components/OnyxProvider';
import * as PaymentUtils from '../../../../libs/PaymentUtils';
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import ConfirmContent from '../../../../components/ConfirmContent';
import Button from '../../../../components/Button';
import themeColors from '../../../../styles/themes/default';
import variables from '../../../../styles/variables';
import useLocalize from '../../../../hooks/useLocalize';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

function BasePaymentsPage(props) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);
    const [shouldShowDefaultDeleteMenu, setShouldShowDefaultDeleteMenu] = useState(false);
    const [showPassword, setShowPassword] = useState({
        shouldShowPasswordPrompt: false,
        passwordButtonText: '',
    });
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
    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });
    const [addPaymentMethodButton, setAddPaymentMethodButton] = useState(null);
    const [showConfirmDeleteContent, setShowConfirmDeleteContent] = useState(false);

    const updateShouldShowLoadingSpinner = useCallback(() => {
        // In order to prevent a loop, only update state of the spinner if there is a change
        const showLoadingSpinner = props.isLoadingPaymentMethods || false;
        if (showLoadingSpinner !== shouldShowLoadingSpinner) {
            setShouldShowLoadingSpinner(props.isLoadingPaymentMethods && !props.network.isOffline);
        }
    }, [props.isLoadingPaymentMethods, props.network.isOffline, shouldShowLoadingSpinner]);

    const debounceSetShouldShowLoadingSpinner = _.debounce(updateShouldShowLoadingSpinner, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

    /**
     * Set position of the payment menu
     *
     * @param {Object} position
     */
    const setPositionAddPaymentMenu = useCallback(
        (position) => {
            setAnchorPosition({
                anchorPositionTop: position.top + position.height + variables.addPaymentPopoverTopSpacing,

                // We want the position to be 13px to the right of the left border
                anchorPositionRight: windowWidth - position.right + variables.addPaymentPopoverRightSpacing,
                anchorPositionHorizontal: position.x,
                anchorPositionVertical: position.y,
            });
        },
        [windowWidth],
    );

    const setMenuPosition = useCallback(() => {
        if (!addPaymentMethodButton) {
            return;
        }
        const buttonPosition = getClickedTargetLocation(addPaymentMethodButton);
        setPositionAddPaymentMenu(buttonPosition);
    }, [addPaymentMethodButton, setPositionAddPaymentMenu]);

    const getSelectedPaymentMethodID = useCallback(() => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            return CONST.PAYMENT_METHODS.PAYPAL;
        }
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            return paymentMethod.selectedPaymentMethod.bankAccountID;
        }
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return paymentMethod.selectedPaymentMethod.fundID;
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);

    const resetSelectedPaymentMethodData = useCallback(() => {
        // The below state values are used by payment method modals and we reset them while closing the modals.
        // We should only reset the values when the modal animation is completed and so using InteractionManager.runAfterInteractions which fires after all animaitons are complete
        InteractionManager.runAfterInteractions(() => {
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
        const position = getClickedTargetLocation(nativeEvent.currentTarget);
        setAddPaymentMethodButton(nativeEvent.currentTarget);

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod;
            if (accountType === CONST.PAYMENT_METHODS.PAYPAL) {
                formattedSelectedPaymentMethod = {
                    title: 'PayPal.me',
                    icon: account.icon,
                    description: PaymentUtils.getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.PAYPAL,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
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
            setPositionAddPaymentMenu(position);
            return;
        }
        setShouldShowAddPaymentMenu(true);
        setPositionAddPaymentMenu(position);
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

        if (paymentType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            return;
        }

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
    const hideDefaultDeleteMenu = useCallback(
        (shouldClearSelectedData = true) => {
            setShouldShowDefaultDeleteMenu(false);
            InteractionManager.runAfterInteractions(() => {
                setShowConfirmDeleteContent(false);
                if (shouldClearSelectedData) {
                    resetSelectedPaymentMethodData();
                }
            });
        },
        [setShouldShowDefaultDeleteMenu, setShowConfirmDeleteContent, resetSelectedPaymentMethodData],
    );

    const makeDefaultPaymentMethod = useCallback(() => {
        const paymentCardList = props.fundList || props.cardList || {};
        const paymentCardOnyxKey = props.fundList ? ONYXKEYS.FUND_LIST : ONYXKEYS.CARD_LIST;
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = PaymentUtils.formatPaymentMethods(props.bankAccountList, paymentCardList);

        const previousPaymentMethod = _.find(paymentMethods, (method) => method.isDefault);
        const currentPaymentMethod = _.find(paymentMethods, (method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            PaymentMethods.makeDefaultPaymentMethod(paymentMethod.selectedPaymentMethod.bankAccountID, null, previousPaymentMethod, currentPaymentMethod, paymentCardOnyxKey);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.makeDefaultPaymentMethod(null, paymentMethod.selectedPaymentMethod.fundID, previousPaymentMethod, currentPaymentMethod, paymentCardOnyxKey);
        }
        resetSelectedPaymentMethodData();
    }, [
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        props.bankAccountList,
        props.cardList,
        props.fundList,
        resetSelectedPaymentMethodData,
    ]);

    const deletePaymentMethod = useCallback(() => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            PaymentMethods.deletePayPalMe();
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            BankAccounts.deletePaymentBankAccount(paymentMethod.selectedPaymentMethod.bankAccountID);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.deletePaymentCard(paymentMethod.selectedPaymentMethod.fundID);
        }
        resetSelectedPaymentMethodData();
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType, resetSelectedPaymentMethodData]);

    const navigateToTransferBalancePage = () => {
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_TRANSFER_BALANCE);
    };

    const navigateToAddPaypalRoute = () => {
        Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        setShouldShowDefaultDeleteMenu(false);
    };

    const listHeaderComponent = () => (
        <>
            {Permissions.canUseWallet(props.betas) && (
                <>
                    <View style={[styles.mv5]}>
                        {shouldShowLoadingSpinner ? (
                            <ActivityIndicator
                                color={themeColors.spinner}
                                size="large"
                            />
                        ) : (
                            <OfflineWithFeedback
                                pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                                errors={props.walletTerms.errors}
                                onClose={PaymentMethods.clearWalletTermsError}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                            >
                                <CurrentWalletBalance />
                            </OfflineWithFeedback>
                        )}
                    </View>
                    {props.userWallet.currentBalance > 0 && (
                        <View style={styles.mb3}>
                            <KYCWall
                                onSuccessfulKYC={navigateToTransferBalancePage}
                                enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                popoverPlacement="bottom"
                            >
                                {(triggerKYCFlow) => (
                                    <MenuItem
                                        title={translate('common.transferBalance')}
                                        icon={Expensicons.Transfer}
                                        onPress={triggerKYCFlow}
                                        shouldShowRightIcon
                                        disabled={props.network.isOffline}
                                    />
                                )}
                            </KYCWall>
                        </View>
                    )}
                </>
            )}
            <Text style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>{translate('paymentsPage.paymentMethodsTitle')}</Text>
        </>
    );

    useEffect(() => {
        PaymentMethods.openPaymentsPage();
    }, []);

    useEffect(() => {
        // If the user was previously offline, skip debouncing showing the loader
        if (!props.network.isOffline) {
            updateShouldShowLoadingSpinner();
        } else {
            debounceSetShouldShowLoadingSpinner();
        }
    }, [props.network.isOffline, debounceSetShouldShowLoadingSpinner, updateShouldShowLoadingSpinner]);

    useEffect(() => {
        if (props.network.isOffline) {
            return;
        }
        PaymentMethods.openPaymentsPage();
    }, [props.network.isOffline]);

    useEffect(() => {
        if (!props.shouldListenForResize) {
            return;
        }
        setMenuPosition();
    }, [props.shouldListenForResize, setMenuPosition]);

    useEffect(() => {
        if (!shouldShowDefaultDeleteMenu && !showPassword.shouldShowPasswordPrompt) {
            return;
        }

        // We should reset selected payment method state values and close corresponding modals if the selected payment method is deleted
        let shouldResetPaymentMethodData = false;

        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT && _.isEmpty(props.bankAccountList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && _.isEmpty(props.cardList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL && _.isEmpty(props.payPalMeData)) {
            shouldResetPaymentMethodData = true;
        }
        if (shouldResetPaymentMethodData) {
            // Close corresponding selected payment method modals which are open
            if (shouldShowDefaultDeleteMenu) {
                hideDefaultDeleteMenu();
            }
        }
    }, [
        hideDefaultDeleteMenu,
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethodType,
        props.bankAccountList,
        props.cardList,
        props.payPalMeData,
        shouldShowDefaultDeleteMenu,
        showPassword.shouldShowPasswordPrompt,
    ]);

    const isPayPalMeSelected = paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PAYPAL;
    const shouldShowMakeDefaultButton =
        !paymentMethod.isSelectedPaymentMethodDefault &&
        Permissions.canUseWallet(props.betas) &&
        !isPayPalMeSelected &&
        !(paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT && paymentMethod.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);

    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || isSmallScreenWidth;

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('common.payments')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            />
            <View style={[styles.flex1, styles.mb4]}>
                <OfflineWithFeedback
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                    onClose={() => PaymentMethods.clearWalletError()}
                    errors={props.userWallet.errors}
                    errorRowStyles={[styles.ph6]}
                >
                    <PaymentMethodList
                        onPress={paymentMethodPressed}
                        style={[styles.flex4]}
                        isAddPaymentMenuActive={shouldShowAddPaymentMenu}
                        actionPaymentMethodType={shouldShowDefaultDeleteMenu || showPassword.shouldShowPasswordPrompt ? paymentMethod.selectedPaymentMethodType : ''}
                        activePaymentMethodID={shouldShowDefaultDeleteMenu || showPassword.shouldShowPasswordPrompt ? getSelectedPaymentMethodID() : ''}
                        listHeaderComponent={listHeaderComponent}
                    />
                </OfflineWithFeedback>
            </View>
            <AddPaymentMethodMenu
                isVisible={shouldShowAddPaymentMenu}
                onClose={hideAddPaymentMenu}
                anchorPosition={{
                    horizontal: anchorPosition.anchorPositionHorizontal,
                    vertical: anchorPosition.anchorPositionVertical - 10,
                }}
                onItemSelected={(method) => addPaymentMethodTypePressed(method)}
            />
            <Popover
                isVisible={shouldShowDefaultDeleteMenu}
                onClose={hideDefaultDeleteMenu}
                anchorPosition={{
                    top: anchorPosition.anchorPositionTop,
                    right: anchorPosition.anchorPositionRight,
                }}
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
                                    setShouldShowDefaultDeleteMenu(false);

                                    // Wait for the previous modal to close, before opening a new one. A modal will be considered completely closed when closing animation is finished.
                                    // InteractionManager fires after the currently running animation is completed.
                                    // https://github.com/Expensify/App/issues/7768#issuecomment-1044879541
                                    InteractionManager.runAfterInteractions(() => {
                                        if (Permissions.canUsePasswordlessLogins(props.betas)) {
                                            makeDefaultPaymentMethod();
                                        } else {
                                            setShowPassword({
                                                shouldShowPasswordPrompt: true,
                                                passwordButtonText: translate('paymentsPage.setDefaultConfirmation'),
                                            });
                                        }
                                    });
                                }}
                                text={translate('paymentsPage.setDefaultConfirmation')}
                            />
                        )}
                        {isPayPalMeSelected && (
                            <Button
                                onPress={navigateToAddPaypalRoute}
                                style={[styles.mb4]}
                                text={translate('common.edit')}
                                shouldUseDefaultHover
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
                            hideDefaultDeleteMenu(false);
                            deletePaymentMethod();
                        }}
                        onCancel={hideDefaultDeleteMenu}
                        contentStyles={!isSmallScreenWidth ? [styles.sidebarPopover, styles.willChangeTransform] : undefined}
                        title={translate('paymentsPage.deleteAccount')}
                        prompt={translate('paymentsPage.deleteConfirmation')}
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
    );
}

BasePaymentsPage.propTypes = propTypes;
BasePaymentsPage.defaultProps = defaultProps;
BasePaymentsPage.displayName = BasePaymentsPage;

export default compose(
    withNetwork(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
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
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        fundList: {
            key: ONYXKEYS.FUND_LIST,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
        payPalMeData: {
            key: ONYXKEYS.PAYPAL,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
        },
    }),
)(BasePaymentsPage);
