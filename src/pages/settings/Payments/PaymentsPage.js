import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PaymentMethodList from './PaymentMethodList';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextInputFocusable from '../../../components/TextInputFocusable';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import Text from '../../../components/Text';
import {deleteBankAccount} from '../../../libs/actions/BankAccounts';
import getPaymentMethods from '../../../libs/actions/PaymentMethods';
import Popover from '../../../components/Popover';
import {PayPal, Bank, CreditCard} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import getClickedElementLocation from '../../../libs/getClickedElementLocation';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import NameValuePair from '../../../libs/actions/NameValuePair';
import CONST from '../../../CONST';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';

const PAYPAL = 'payPalMe';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowAddPaymentMenu: false,
            shouldShowDefaultDeleteMenu: false,
            shouldShowPasswordPrompt: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {},
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
            isLoadingPaymentMethods: true,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.hideDefaultDeleteMenu = this.hideDefaultDeleteMenu.bind(this);
        this.makeDefaultPaymentMethod = this.makeDefaultPaymentMethod.bind(this);
        this.deletePaymentMethod = this.deletePaymentMethod.bind(this);
        this.hidePasswordPrompt = this.hidePasswordPrompt.bind(this);
    }

    componentDidMount() {
        getPaymentMethods().then(() => {
            this.setState({isLoadingPaymentMethods: false});
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

    makeDefaultPaymentMethod() {
        if (this.state.selectedPaymentMethodType === 'PayPal.me') {

        } else if (this.state.selectedPaymentMethodType === 'bankAccount') {

        } else if (this.state.selectedPaymentMethodType === 'card') {

        }
    }

    deletePaymentMethod() {
        if (this.state.selectedPaymentMethodType === 'PayPal.me') {
            NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, null);
        } else if (this.state.selectedPaymentMethodType === 'bankAccount') {
            this.setState({shouldShowDefaultDeleteMenu: false, shouldShowPasswordPrompt: true});
        } else if (this.state.selectedPaymentMethodType === 'card') {

        }
    }

    deleteBankAccount(password) {
        debugger;
        deleteBankAccount(this.state.selectedPaymentMethod, password);
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
                    <View>
                        <CurrentWalletBalance />
                        <Text
                            style={[styles.ph5, styles.textStrong]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </Text>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isLoadingPayments={this.state.isLoadingPaymentMethods}
                        />
                    </View>
                    <Popover
                        isVisible={this.state.shouldShowAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        <MenuItem
                            title="PayPal.me"
                            icon={PayPal}
                            onPress={() => this.addPaymentMethodTypePressed(PAYPAL)}
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
                            onPress={this.makeDefaultPaymentMethod}
                            style={[styles.button, styles.mh2, styles.mt2, styles.defaultOrDeleteButton]}
                        >
                            <Text style={[styles.buttonText]}>
                                Make Default Payment Method
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.deletePaymentMethod}
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
                    <Popover
                        isVisible={this.state.shouldShowPasswordPrompt}
                        onClose={this.hidePasswordPrompt}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        <Text
                            style={[
                                styles.h1,
                                styles.m2,
                            ]}
                        >
                            Please enter your password
                        </Text>
                        <TextInputFocusable
                            style={styles.textInputCompose}
                            onChangeText={password => this.setState({password})}
                        />
                        <TouchableOpacity
                            onPress={() => deleteBankAccount(this.state.selectedPaymentMethod, this.state.password)}
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
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withWindowDimensions,
    withLocalize,
)(PaymentsPage);
