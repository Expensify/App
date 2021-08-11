import React from 'react';
import {View} from 'react-native';
import PaymentMethodList from './PaymentMethodList';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import Text from '../../../components/Text';
import getPaymentMethods from '../../../libs/actions/PaymentMethods';
import Popover from '../../../components/Popover';
import {PayPal} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import getClickedElementLocation from '../../../libs/getClickedElementLocation';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';

const PAYPAL = 'payPalMe';

const propTypes = {
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
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
            isLoadingPaymentMethods: true,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
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
     * @param {String} account
     */
    paymentMethodPressed(nativeEvent, account) {
        if (account) {
            if (account === PAYPAL) {
                Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            }
        } else {
            const position = getClickedElementLocation(nativeEvent);
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
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withLocalize,
)(PaymentsPage);
