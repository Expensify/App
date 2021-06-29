import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import {
    Bank,
    CreditCard,
    PayPal,
    Plus,
} from '../../../components/Icon/Expensicons';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** Array of bank account objects */
    bankAccountList: PropTypes.arrayOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc */
        addressName: PropTypes.string,

        /** The masked bank account number */
        accountNumber: PropTypes.string,

        /** The bankAccountID in the bankAccounts db */
        bankAccountID: PropTypes.string,
    })),

    /** Array of card objects */
    cardList: PropTypes.arrayOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc */
        cardName: PropTypes.string,

        /** The masked credit card number */
        cardNumber: PropTypes.string,

        /** The ID of the card in the cards DB */
        cardID: PropTypes.string,
    })),

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
    bankAccountList: [],
    cardList: [],
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    /**
     * Take all of the different payment methods and create a list that can be easily digested by renderItem
     *
     * @returns {Array}
     */
    createPaymentMethodList() {
        const combinedPaymentMethods = [];

        combinedPaymentMethods.push({
            title: this.props.translate('paymentMethodList.addPaymentMethod'),
            icon: Plus,
            onPress: e => this.props.onPress(e),
            key: 'addPaymentMethodButton',
        });

        if (this.props.payPalMeUsername) {
            combinedPaymentMethods.push({
                title: 'PayPal.me',
                description: this.props.payPalMeUsername,
                icon: PayPal,
                onPress: e => this.props.onPress(e, 'payPalMe'),
                key: 'payPalMePaymentMethod',
            });
        }

        _.each(this.props.bankAccountList, (bankAccount) => {
            combinedPaymentMethods.push({
                title: bankAccount.addressName,

                // eslint-disable-next-line
                description: `${this.props.translate('paymentMethodList.accountLastFour')} ${bankAccount.accountNumber.slice(-4)}`,
                icon: Bank,
                onPress: e => this.props.onPress(e, bankAccount.bankAccountID),
                key: `bankAccount-${bankAccount.bankAccountID}`,
            });
        });

        _.each(this.props.cardList, (card) => {
            if (card.cardName !== CONST.CARD_TYPES.DEFAULT_CASH) {
                combinedPaymentMethods.push({
                    title: card.cardName,

                    // eslint-disable-next-line
                    description: `${this.props.translate('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`,
                    icon: CreditCard,
                    onPress: e => this.props.onPress(e, card.cardID),
                    key: `card-${card.cardID}`,
                });
            }
        });

        return combinedPaymentMethods;
    }

    /**
     * Create a menuItem for each passed paymentMethod
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {React.Component}
     */
    renderItem({item}) {
        return (
            <MenuItem
                onPress={item.onPress}
                title={item.title}
                description={item.description}
                icon={item.icon}
                key={item.key}
            />
        );
    }

    render() {
        const combinedPaymentMethods = this.createPaymentMethodList();

        return (
            <FlatList
                data={combinedPaymentMethods}
                inverted
                renderItem={this.renderItem}
                bounces
            />
        );
    }
}

PaymentMethodList.propTypes = propTypes;
PaymentMethodList.defaultProps = defaultProps;

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
)(PaymentMethodList);
