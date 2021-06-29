import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import {
    Bank,
    CreditCard,
    PayPal,
    Plus,
} from '../../../components/Icon/Expensicons';

const propTypes = {
    // What to do when a menu item is pressed
    onPress: PropTypes.func.isRequired,

    // Users paypal.me username if they have one
    payPalMeUsername: PropTypes.string,

    // Array of bank account objects
    bankAccountList: PropTypes.arrayOf(PropTypes.shape({
        addressName: PropTypes.string,
        accountNubmer: PropTypes.string,
    })),

    // Array of card objects
    cardList: PropTypes.arrayOf(PropTypes.shape({
        cardName: PropTypes.string,
        accountNumber: PropTypes.string,
    })),
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
            title: 'Add Payment Method',
            icon: Plus,
            onPress: e => this.props.onPress(e),
        });

        if (this.props.payPalMeUsername) {
            combinedPaymentMethods.push({
                title: 'PayPal.me',
                description: this.props.payPalMeUsername,
                icon: PayPal,
                onPress: e => this.props.onPress(e, 'payPalMe'),
            });
        }

        _.each(this.props.bankAccountList, (bankAccount) => {
            combinedPaymentMethods.push({
                title: bankAccount.addressName,
                description: `Account ending in ${bankAccount.accountNumber.slice(-4)}`,
                icon: Bank,
                onPress: e => this.props.onPress(e, bankAccount.bankAccountID),
            });
        });

        _.each(this.props.cardList, (card) => {
            if (card.cardName !== '__CASH__') {
                combinedPaymentMethods.push({
                    title: card.cardName,
                    description: `Card ending in ${card.cardNumber.slice(-4)}`,
                    icon: CreditCard,
                    onPress: e => this.props.onPress(e, card.cardID),
                });
            }
        });

        return combinedPaymentMethods;
    }

    /**
     * Render item method wraps the prop renderItem to render in a
     * View component so we can attach an onLayout handler and
     * measure it when it renders.
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     *
     * @return {React.Component}
     */
    renderItem({item, index}) {
        return (
            <MenuItem
                onPress={item.onPress}
                title={item.title}
                description={item.description}
                icon={item.icon}
                key={`paymentMethod-${index}`}
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
