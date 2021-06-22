import React from 'react';
import {View} from 'react-native';
import PaymentMethodList from './paymentMethodList';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import getPaymentMethods from '../../../libs/actions/PaymentMethods';

const propTypes = {
    ...withLocalizePropTypes,
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showDefaultOrDeleteMenu: false,
            selectedPaymentMethodIndex: null,
            showAddPaymentMenu: false,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodPressed = this.addPaymentMethodPressed.bind(this);
    }

    componentDidMount() {
        getPaymentMethods();
    }

    paymentMethodPressed(account) {
        this.setState({
            showDefaultOrDeleteMenu: true,
            selectedPaymentMethod: account,
        });
    }

    addPaymentMethodPressed() {
        this.setState({showAddPaymentMenu: true});
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
                    <FixedFooter>
                        <Button
                            success
                            style={[styles.mt3]}
                            text={this.props.translate('addPayPalMePage.addPayPalAccount')}
                        />
                    </FixedFooter>
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
