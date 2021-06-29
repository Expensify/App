import React from 'react';
import {View} from 'react-native';
import PaymentMethodList from '../PaymentMethodList';
import ROUTES from '../../../../ROUTES';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import KeyboardAvoidingView from '../../../../components/KeyboardAvoidingView';
import getPaymentMethods from '../../../../libs/actions/PaymentMethods';
import Popover from '../../../../components/Popover';
import {PayPal} from '../../../../components/Icon/Expensicons';
import MenuItem from '../../../../components/MenuItem';
import getPaymentMethodScreenLocation from '../../../../libs/getPaymentMethodScreenLocation';

const propTypes = {
    ...withLocalizePropTypes,
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.PAYPAL = 'payPalMe';

        this.state = {
            showAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
    }

    componentDidMount() {
        getPaymentMethods();
    }

    paymentMethodPressed(nativeEvent, account) {
        if (account) {
            // TODO: Show the make default/delete popover
        } else {
            const position = getPaymentMethodScreenLocation(nativeEvent);
            this.setState({
                showAddPaymentMenu: true,
                anchorPositionTop: position.bottom,
                anchorPositionLeft: position.left,
            });
        }
    }

    addPaymentMethodTypePressed(paymentType) {
        this.hideAddPaymentMenu();

        if (paymentType === this.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        }
    }

    hideAddPaymentMenu() {
        this.setState({showAddPaymentMenu: false});
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
                    <View style={[styles.flex1, styles.p5]}>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                        />
                    </View>
                    <Popover
                        isVisible={this.state.showAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        <MenuItem
                            title="PayPal.me"
                            icon={PayPal}
                            onPress={() => this.addPaymentMethodTypePressed(this.PAYPAL)}
                        />
                    </Popover>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withLocalize,
)(PaymentsPage);
