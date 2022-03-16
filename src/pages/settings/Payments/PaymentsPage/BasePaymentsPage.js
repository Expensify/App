import React from 'react';
import {
    View, TouchableOpacity, Dimensions, InteractionManager, LayoutAnimation,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PaymentMethodList from '../PaymentMethodList';
import ROUTES from '../../../../ROUTES';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import PasswordPopover from '../../../../components/PasswordPopover';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import withLocalize from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import KeyboardAvoidingView from '../../../../components/KeyboardAvoidingView/index';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import Popover from '../../../../components/Popover';
import MenuItem from '../../../../components/MenuItem';
import Text from '../../../../components/Text';
import * as PaymentMethods from '../../../../libs/actions/PaymentMethods';
import getClickedElementLocation from '../../../../libs/getClickedElementLocation';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import CurrentWalletBalance from '../../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../../ONYXKEYS';
import Permissions from '../../../../libs/Permissions';
import ConfirmPopover from '../../../../components/ConfirmPopover';
import AddPaymentMethodMenu from '../../../../components/AddPaymentMethodMenu';
import CONST from '../../../../CONST';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import ConfirmModal from '../../../../components/ConfirmModal';
import KYCWall from '../../../../components/KYCWall';
import {propTypes, defaultProps} from './paymentsPagePropTypes';

class BasePaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowAddPaymentMenu: false,
            shouldShowDefaultDeleteMenu: false,
            shouldShowPasswordPrompt: false,
            shouldShowConfirmPopover: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {},
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
            addPaymentMethodButton: null,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.hideDefaultDeleteMenu = this.hideDefaultDeleteMenu.bind(this);
        this.makeDefaultPaymentMethod = this.makeDefaultPaymentMethod.bind(this);
        this.deletePaymentMethod = this.deletePaymentMethod.bind(this);
        this.hidePasswordPrompt = this.hidePasswordPrompt.bind(this);
        this.navigateToTransferBalancePage = this.navigateToTransferBalancePage.bind(this);
        this.setMenuPosition = this.setMenuPosition.bind(this);
    }

    componentDidMount() {
        PaymentMethods.getPaymentMethods();
        if (this.props.shouldListenForResize) {
            this.dimensionsSubscription = Dimensions.addEventListener('change', this.setMenuPosition);
        }
    }

    componentWillUnmount() {
        if (!this.props.shouldListenForResize || !this.dimensionsSubscription) {
            return;
        }
        this.dimensionsSubscription.remove();
    }

    setMenuPosition() {
        if (!this.state.addPaymentMethodButton) {
            return;
        }
        const buttonPosition = getClickedElementLocation(this.state.addPaymentMethodButton);
        this.setPositionAddPaymentMenu(buttonPosition);
    }

    getSelectedPaymentMethodID() {
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            return CONST.PAYMENT_METHODS.PAYPAL;
        }
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            return this.state.selectedPaymentMethod.bankAccountID;
        }
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return this.state.selectedPaymentMethod.fundID;
        }
    }

    /**
     * Set position of the payment menu
     *
     * @param {Object} position
     */
    setPositionAddPaymentMenu(position) {
        this.setState({
            anchorPositionTop: position.bottom,

            // We want the position to be 13px to the right of the left border
            anchorPositionLeft: position.left + 13,
        });
    }

    /**
     * Display the delete/default menu, or the add payment method menu
     *
     * @param {Object} nativeEvent
     * @param {String} accountType
     * @param {String} account
     */
    paymentMethodPressed(nativeEvent, accountType, account) {
        const position = getClickedElementLocation(nativeEvent);
        this.setState({
            addPaymentMethodButton: nativeEvent,
        });
        if (accountType) {
            let formattedSelectedPaymentMethod;
            if (accountType === CONST.PAYMENT_METHODS.PAYPAL) {
                formattedSelectedPaymentMethod = {
                    title: 'PayPal.me',
                    icon: account.icon,
                    description: account.username,
                    type: CONST.PAYMENT_METHODS.PAYPAL,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: `${this.props.translate('paymentMethodList.accountLastFour')} ${account.accountNumber.slice(-4)}`,
                    type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: `${this.props.translate('paymentMethodList.cardLastFour')} ${account.cardNumber.slice(-4)}`,
                    type: CONST.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            this.setState({
                shouldShowDefaultDeleteMenu: true,
                selectedPaymentMethod: account,
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
            });
            this.setPositionAddPaymentMenu(position);
            return;
        }
        this.setState({
            shouldShowAddPaymentMenu: true,
        });
        this.setPositionAddPaymentMenu(position);
    }

    /**
     * Navigate to the appropriate payment type addition screen
     *
     * @param {String} paymentType
     */
    addPaymentMethodTypePressed(paymentType) {
        this.hideAddPaymentMenu();

        if (paymentType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
            return;
        }

        throw new Error('Invalid payment method type selected');
    }

    /**
     * Hide the add payment modal
     */
    hideAddPaymentMenu() {
        this.setState({shouldShowAddPaymentMenu: false});
    }

    /**
     * Hide the default / delete modal
     */
    hideDefaultDeleteMenu() {
        this.setState({shouldShowDefaultDeleteMenu: false});
    }

    hidePasswordPrompt() {
        this.setState({shouldShowPasswordPrompt: false});

        // Fixes iOS Freeze issue
        LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    }

    makeDefaultPaymentMethod(password) {
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            PaymentMethods.setWalletLinkedAccount(password, this.state.selectedPaymentMethod.bankAccountID, null);
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.setWalletLinkedAccount(password, null, this.state.selectedPaymentMethod.fundID);
        }
    }

    deletePaymentMethod() {
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            PaymentMethods.deletePayPalMe();
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            BankAccounts.deleteBankAccount(this.state.selectedPaymentMethod.bankAccountID);
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.deleteDebitCard(this.state.selectedPaymentMethod.fundID);
        }
    }

    navigateToTransferBalancePage() {
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_TRANSFER_BALANCE);
    }

    render() {
        const isPayPalMeSelected = this.state.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PAYPAL;

        // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
        const isPopoverBottomMount = this.state.anchorPositionTop === 0 || this.props.isSmallScreenWidth;
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.payments')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <View style={styles.flex1}>
                        {Permissions.canUseWallet(this.props.betas) && (
                            <>
                                <View style={[styles.mv5]}>
                                    <CurrentWalletBalance />
                                </View>
                                {this.props.userWallet.currentBalance > 0 && (
                                    <KYCWall
                                        onSuccessfulKYC={this.navigateToTransferBalancePage}
                                        enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                        addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                        addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                        popoverPlacement="bottom"
                                    >
                                        {triggerKYCFlow => (
                                            <MenuItem
                                                title={this.props.translate('common.transferBalance')}
                                                icon={Expensicons.Transfer}
                                                onPress={triggerKYCFlow}
                                                shouldShowRightIcon
                                            />
                                        )}
                                    </KYCWall>
                                )}
                            </>
                        )}
                        <Text
                            style={[styles.ph5, styles.mt6, styles.formLabel]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </Text>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isLoadingPayments={this.props.isLoadingPaymentMethods}
                            isAddPaymentMenuActive={this.state.shouldShowAddPaymentMenu}
                            actionPaymentMethodType={this.state.shouldShowDefaultDeleteMenu || this.state.shouldShowPasswordPrompt || this.state.shouldShowConfirmPopover
                                ? this.state.selectedPaymentMethodType
                                : ''}
                            activePaymentMethodID={this.state.shouldShowDefaultDeleteMenu || this.state.shouldShowPasswordPrompt || this.state.shouldShowConfirmPopover
                                ? this.getSelectedPaymentMethodID()
                                : ''}
                        />
                    </View>
                    <AddPaymentMethodMenu
                        isVisible={this.state.shouldShowAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                        onItemSelected={method => this.addPaymentMethodTypePressed(method)}
                    />
                    <Popover
                        isVisible={this.state.shouldShowDefaultDeleteMenu}
                        onClose={this.hideDefaultDeleteMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        <View
                            style={[
                                styles.m5,
                                !this.props.isSmallScreenWidth ? styles.sidebarPopover : '',
                            ]}
                        >
                            {isPopoverBottomMount && (
                                <MenuItem
                                    title={this.state.formattedSelectedPaymentMethod.title}
                                    icon={this.state.formattedSelectedPaymentMethod.icon}
                                    description={this.state.formattedSelectedPaymentMethod.description}
                                    wrapperStyle={[styles.pv0, styles.ph0, styles.mb4]}
                                    disabled
                                    interactive={false}
                                />
                            )}
                            {Permissions.canUseWallet(this.props.betas) && !isPayPalMeSelected && (
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({
                                            shouldShowDefaultDeleteMenu: false,
                                        });
                                        InteractionManager.runAfterInteractions(() => {
                                            this.setState({
                                                shouldShowPasswordPrompt: true,
                                                passwordButtonText: this.props.translate('paymentsPage.setDefaultConfirmation'),
                                            });
                                        });
                                    }}
                                    style={[styles.button, styles.alignSelfCenter, styles.w100]}
                                >
                                    <Text style={[styles.buttonText]}>
                                        {this.props.translate('paymentsPage.setDefaultConfirmation')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        shouldShowDefaultDeleteMenu: false,
                                    });
                                    InteractionManager.runAfterInteractions(() => {
                                        this.setState({
                                            shouldShowConfirmPopover: true,
                                        });
                                    });
                                }}
                                style={[
                                    styles.button,
                                    styles.buttonDanger,
                                    Permissions.canUseWallet(this.props.betas) && !isPayPalMeSelected && styles.mt4,
                                    styles.alignSelfCenter,
                                    styles.w100,
                                ]}
                            >
                                <Text style={[styles.buttonText, styles.textWhite]}>
                                    {this.props.translate('common.delete')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Popover>
                    <PasswordPopover
                        isVisible={this.state.shouldShowPasswordPrompt}
                        onClose={this.hidePasswordPrompt}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                        onSubmit={(password) => {
                            this.hidePasswordPrompt();
                            this.makeDefaultPaymentMethod(password);
                        }}
                        submitButtonText={this.state.passwordButtonText}
                        isDangerousAction
                    />
                    <ConfirmPopover
                        contentStyles={!this.props.isSmallScreenWidth ? [styles.sidebarPopover] : undefined}
                        isVisible={this.state.shouldShowConfirmPopover}
                        title={this.props.translate('paymentsPage.deleteAccount')}
                        prompt={this.props.translate('paymentsPage.deleteConfirmation')}
                        confirmText={this.props.translate('common.delete')}
                        cancelText={this.props.translate('common.cancel')}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                        onConfirm={() => {
                            this.setState({
                                shouldShowConfirmPopover: false,
                            });
                            this.deletePaymentMethod();
                        }}
                        onCancel={() => {
                            this.setState({shouldShowConfirmPopover: false});
                        }}
                        shouldShowCancelButton
                        danger
                    />
                    <ConfirmModal
                        title={this.props.translate('paymentsPage.allSet')}
                        onConfirm={PaymentMethods.dismissWalletConfirmModal}
                        isVisible={this.props.walletTransfer.shouldShowConfirmModal}
                        prompt={this.props.translate('paymentsPage.transferConfirmText', {
                            amount: this.props.numberFormat(
                                this.props.walletTransfer.transferAmount / 100,
                                {style: 'currency', currency: 'USD'},
                            ),
                        })}
                        confirmText={this.props.translate('paymentsPage.gotIt')}
                        shouldShowCancelButton={false}
                    />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

BasePaymentsPage.propTypes = propTypes;
BasePaymentsPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(BasePaymentsPage);
