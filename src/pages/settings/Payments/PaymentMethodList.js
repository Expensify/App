import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../../../styles/styles';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import {
    PayPal,
    Plus,
} from '../../../components/Icon/Expensicons';
import getBankIcon from '../../../components/Icon/BankIcons';
import bankAccountPropTypes from '../../../components/bankAccountPropTypes';

const MENU_ITEM = 'menuItem';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Are we loading payments from the server? */
    isLoadingPayments: PropTypes.bool,

    /** Is the payment options menu open / active? */
    isAddPaymentMenuActive: PropTypes.bool,

    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** Array of bank account objects */
    bankAccountList: PropTypes.arrayOf(bankAccountPropTypes),

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
    isAddPaymentMenuActive: false,
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

        _.each(this.props.bankAccountList, (bankAccount) => {
            // Add all bank accounts besides the wallet
            if (bankAccount.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
                return;
            }

            const formattedBankAccountNumber = bankAccount.accountNumber
                ? `${this.props.translate('paymentMethodList.accountLastFour')} ${
                    bankAccount.accountNumber.slice(-4)
                }`
                : null;
            const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'additionalData.bankName', ''));
            combinedPaymentMethods.push({
                type: MENU_ITEM,
                title: bankAccount.addressName,

                // eslint-disable-next-line
                description: formattedBankAccountNumber,
                icon,
                iconSize,
                onPress: e => this.props.onPress(e, bankAccount.bankAccountID),
                key: `bankAccount-${bankAccount.bankAccountID}`,
            });
        });

        _.each(this.props.cardList, (card) => {
            const formattedCardNumber = card.cardNumber
                ? `${this.props.translate('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
                : null;
            const {icon, iconSize} = getBankIcon(card.bank, true);
            combinedPaymentMethods.push({
                type: MENU_ITEM,
                title: card.addressName,
                // eslint-disable-next-line
                description: formattedCardNumber,
                icon,
                iconSize,
                onPress: e => this.props.onPress(e, card.cardNumber),
                key: `card-${card.cardNumber}`,
            });
        });

        if (this.props.payPalMeUsername) {
            combinedPaymentMethods.push({
                type: MENU_ITEM,
                title: 'PayPal.me',
                description: this.props.payPalMeUsername,
                icon: PayPal,
                onPress: e => this.props.onPress(e, 'payPalMe'),
                key: 'payPalMePaymentMethod',
            });
        }

        // If we have not added any payment methods, show a default empty state
        if (_.isEmpty(combinedPaymentMethods)) {
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
            iconFill: this.props.isAddPaymentMenuActive ? getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
            wrapperStyle: this.props.isAddPaymentMenuActive ? [getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : [],
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
        if (item.type === MENU_ITEM) {
            return (
                <MenuItem
                    onPress={item.onPress}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    key={item.key}
                    disabled={item.disabled}
                    iconFill={item.iconFill}
                    iconHeight={item.iconSize}
                    iconWidth={item.iconSize}
                    wrapperStyle={item.wrapperStyle}
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
