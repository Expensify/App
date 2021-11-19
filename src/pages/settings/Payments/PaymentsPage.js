import React from 'react';
import {TouchableOpacity, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import PaymentMethodList from './PaymentMethodList';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import PasswordPopover from '../../../components/PasswordPopover';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import Text from '../../../components/Text';
import {deleteBankAccount} from '../../../libs/actions/BankAccounts';
import {deleteDebitCard, deletePayPalMe, getPaymentMethods, setWalletLinkedAccount} from '../../../libs/actions/PaymentMethods';
import Popover from '../../../components/Popover';
import {PayPal, Bank, CreditCard} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import getClickedElementLocation from '../../../libs/getClickedElementLocation';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../ONYXKEYS';
import Permissions from '../../../libs/Permissions';
import ConfirmPopover from '../../../components/ConfirmPopover';

const PAYPAL = 'payPalMe';
const DEBIT_CARD = 'debitCard';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    /** Username for PayPal.Me */
    payPalMeUsername: PropTypes.string,
};

const defaultProps = {
    betas: [],
    isLoadingPaymentMethods: true,
    payPalMeUsername: '',
};

class PaymentsPage extends React.Component {
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
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.hideDefaultDeleteMenu = this.hideDefaultDeleteMenu.bind(this);
        this.makeDefaultPaymentMethod = this.makeDefaultPaymentMethod.bind(this);
        this.deletePaymentMethod = this.deletePaymentMethod.bind(this);
        this.hidePasswordPrompt = this.hidePasswordPrompt.bind(this);
        this.callPasswordCallbackAndHidePopover = this.callPasswordCallbackAndHidePopover.bind(this);
    }

    componentDidMount() {
        getPaymentMethods();
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
        if (accountType) {
            let formattedSelectedPaymentMethod;
            if (accountType === PAYPAL) {
                formattedSelectedPaymentMethod = {
                    title: 'PayPal.me',
                    icon: PayPal,
                };
            } else if (accountType === 'bankAccount') {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: Bank,
                };
            } else {
                formattedSelectedPaymentMethod = {
                    title: account.cardName,
                    icon: CreditCard,
                };
            }
            this.setState({
                shouldShowDefaultDeleteMenu: true,
                selectedPaymentMethod: account,
                selectedPaymentMethodType: accountType,
                anchorPositionTop: position.bottom,

                // We want the position to be 20px to the right of the left border
                anchorPositionLeft: position.left + 20,
                formattedSelectedPaymentMethod,
            });
        } else {
            this.setState({
                shouldShowAddPaymentMenu: true,
                anchorPositionTop: position.bottom,

                // We want the position to be 20px to the right of the left border
                anchorPositionLeft: position.left + 20,
            });
        }
    }

    /**
     * Navigate to the appropriate payment type addition screen
     *
     * @param {String} paymentType
     */
    addPaymentMethodTypePressed(paymentType) {
        this.hideAddPaymentMenu();

        if (paymentType === PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        }

        if (paymentType === DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
        }
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
    }

    callPasswordCallbackAndHidePopover(password) {
        this.hidePasswordPrompt();
        this.state.passwordFormCallback(password);
    }

    makeDefaultPaymentMethod(password) {
        if (this.state.selectedPaymentMethodType === 'bankAccount') {
            setWalletLinkedAccount(password, this.state.selectedPaymentMethod.bankAccountID, null);
        } else if (this.state.selectedPaymentMethodType === 'card') {
            setWalletLinkedAccount(password, null, this.state.selectedPaymentMethod.fundID);
        }
    }

    deletePaymentMethod() {
        if (this.state.selectedPaymentMethodType === 'payPalMe') {
            deletePayPalMe();
        } else if (this.state.selectedPaymentMethodType === 'bankAccount') {
            deleteBankAccount(this.state.selectedPaymentMethod.bankAccountID);
        } else if (this.state.selectedPaymentMethodType === 'card') {
            deleteDebitCard(this.state.selectedPaymentMethod.fundID);
        }
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.payments')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1}>
                        {
                            Permissions.canUseWallet(this.props.betas) && <CurrentWalletBalance />
                        }
                        <Text
                            style={[styles.ph5, styles.formLabel]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </Text>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isLoadingPayments={this.props.isLoadingPaymentMethods}
                            isAddPaymentMenuActive={this.state.shouldShowAddPaymentMenu}
                        />
                    </ScrollView>
                    <Popover
                        isVisible={this.state.shouldShowAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        {!this.props.payPalMeUsername && (
                            <MenuItem
                                title={this.props.translate('common.payPalMe')}
                                icon={PayPal}
                                onPress={() => this.addPaymentMethodTypePressed(PAYPAL)}
                            />
                        )}
                        <MenuItem
                            title={this.props.translate('common.debitCard')}
                            icon={CreditCard}
                            onPress={() => this.addPaymentMethodTypePressed(DEBIT_CARD)}
                        />
                    </Popover>
                    <Popover
                        isVisible={this.state.shouldShowDefaultDeleteMenu}
                        onClose={this.hideDefaultDeleteMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        {this.props.isSmallScreenWidth && (
                            <MenuItem
                                title={this.state.formattedSelectedPaymentMethod.title}
                                icon={Bank}
                                description={this.state.formattedSelectedPaymentMethod.description}
                                onPress={() => {}}
                            />
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({
                                    shouldShowPasswordPrompt: true,
                                    shouldShowDefaultDeleteMenu: false,
                                    passwordButtonText: 'Make Default Payment Method',
                                    isDangerousAction: false,
                                    passwordFormCallback: this.makeDefaultPaymentMethod,
                                });
                            }}
                            style={[styles.button, styles.mh2, styles.mt2, styles.defaultOrDeleteButton]}
                        >
                            <Text style={[styles.buttonText]}>
                                Make Default Payment Method
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({
                                    shouldShowDefaultDeleteMenu: false,
                                    shouldShowConfirmPopover: true,
                                });
                            }}
                            style={[
                                styles.button,
                                styles.buttonDanger,
                                styles.mh2,
                                styles.mv2,
                                styles.defaultOrDeleteButton,
                            ]}
                        >
                            <Text style={[styles.buttonText]}>
                                {this.props.translate('common.delete')}
                            </Text>
                        </TouchableOpacity>
                    </Popover>
                    <PasswordPopover
                        isVisible={this.state.shouldShowPasswordPrompt}
                        onClose={this.hidePasswordPrompt}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                        onSubmit={this.callPasswordCallbackAndHidePopover}
                        submitButtonText={this.state.passwordButtonText}
                        isDangerousAction={this.state.isDangerousAction}
                    />
                    <ConfirmPopover
                        isVisible={this.state.shouldShowConfirmPopover}
                        title="Are you sure you want to delete this account?"
                        confirmText="Delete"
                        cancelText="Cancel"
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
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(PaymentsPage);
