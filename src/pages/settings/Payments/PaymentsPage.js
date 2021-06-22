import _ from 'underscore';
import React from 'react';
import {TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import PaymentMethodList from './paymentMethodList';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import NameValuePair from '../../../libs/actions/NameValuePair';
import {getUserDetails} from '../../../libs/actions/User';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import getPaymentMethods from '../../../libs/actions/PaymentMethods';
import {Bank} from '../../../components/Icon/Expensicons';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
    bankAccountList: [],
    cardList: [],
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

    paymentMethodPressed(index) {
        this.setState({
            showDefaultOrDeleteMenu: true,
            selectedPaymentMethodIndex: index,
        });
    }

    addPaymentMethodPressed() {
        this.setState({showAddPaymentMenu: true});
    }

    render() {
        const combinedPaymentMethods = [];
        if (this.props.payPalMeUsername) {
            combinedPaymentMethods[0] = {
                primaryText: 'PayPal.me',
                secondaryText: this.props.payPalMeUsername,
                icon: Bank,
            };
        }

        _.each(this.props.bankAccountList, (bankAccount) => {
            combinedPaymentMethods.push({
                primaryText: bankAccount.addressName,
                secondaryText: `Account ending in ${bankAccount.accountNumber.slice(-4)}`,
                icon: Bank,
            });
        });

        _.each(this.props.cardList, (card) => {
            if (card.cardName !== '__CASH__') {
                combinedPaymentMethods.push({
                    primaryText: card.cardName,
                    secondaryText: `Card ending in ${card.cardNumber.slice(-4)}`,
                    icon: Bank,
                });
            }
        });

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
                            data={combinedPaymentMethods}
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
PaymentsPage.defaultProps = defaultProps;
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withLocalize,
    withOnyx({
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(PaymentsPage);
