import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import {
    Bank,
    CreditCard,
    PayPal,
    Plus,
} from '../../../components/Icon/Expensicons';
import {getPaymentMethodsList} from '../../../libs/paymentUtils';

const MENU_ITEM = 'menuItem';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Are we loading payments from the server? */
    isLoadingPayments: PropTypes.bool,

    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** Whether to show selection checkboxes */
    enableSelection: PropTypes.bool,

    /** Selected Account ID if selection is active */
    selectedAccountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Array of bank account objects */
    bankAccountList: PropTypes.arrayOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc */
        addressName: PropTypes.string,

        /** The masked bank account number */
        accountNumber: PropTypes.string,

        /** The bankAccountID in the bankAccounts db */
        bankAccountID: PropTypes.number,

        /** The bank account type */
        type: PropTypes.string,
    })),

    /** Array of card objects */
    cardList: PropTypes.arrayOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc */
        cardName: PropTypes.string,

        /** The masked credit card number */
        cardNumber: PropTypes.string,

        /** The ID of the card in the cards DB */
        cardID: PropTypes.number,
    })),

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
    bankAccountList: [],
    cardList: [],
    isLoadingPayments: false,
    enableSelection: false,
    selectedAccountID: '',
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedAccountID: this.props.selectedAccountID,
        };
        this.renderItem = this.renderItem.bind(this);
        this.selectPaymentMethod = this.selectPaymentMethod.bind(this);
    }

    /**
     * Take all of the different payment methods and create a list that can be easily digested by renderItem
     *
     * @returns {Array}
     */
    createPaymentMethodList() {
        const paymentMethods = getPaymentMethodsList(
            this.props.bankAccountList,
            this.props.cardList,
            this.props.payPalMeUsername,
        );
        const combinedPaymentMethods = _.map(paymentMethods, (method) => {
            let icon;

            switch (method.type) {
                case 'bank': icon = Bank; break;
                case 'card': icon = CreditCard; break;
                case 'payPalMe': icon = PayPal; break;
                default: break;
            }

            return {
                ...method,
                icon,
                type: MENU_ITEM,
                onPress: e => this.props.onPress(e, method.id),
            };
        });

        // If we have not added any payment methods, show a default empty state
        if (_.isEmpty(paymentMethods)) {
            combinedPaymentMethods.push({
                text: this.props.translate('paymentMethodList.addFirstPaymentMethod'),
            });
        }

        combinedPaymentMethods.push({
            type: MENU_ITEM,
            title: this.props.translate('paymentMethodList.addPaymentMethod'),
            icon: Plus,
            onPress: e => this.props.onPress(e),
            key: 'addPaymentMethodButton',
            disabled: this.props.isLoadingPayments,
        });

        return combinedPaymentMethods;
    }

    /**
     * Select the payment method
     *
     * @param {Object} e EventObject
     * @param {Object} item PaymentMethod
     * @memberof PaymentMethodList
     */
    selectPaymentMethod(e, item) {
        item.onPress(e);
        this.setState({selectedAccountID: item.id});
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
        if (item.type === MENU_ITEM) {
            return (
                <MenuItem
                    onPress={e => this.selectPaymentMethod(e, item)}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    key={item.key}
                    disabled={item.disabled}
                    showSelectedState={this.props.enableSelection}
                    selected={this.state.selectedAccountID === item.id}
                />
            );
        }

        return (
            <Text
                style={[styles.popoverMenuItem]}
            >
                {item.text}
            </Text>
        );
    }

    render() {
        return (
            <FlatList
                data={this.createPaymentMethodList()}
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
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(PaymentMethodList);
