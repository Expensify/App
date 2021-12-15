import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import {FlatList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import PaymentUtils from '../../../libs/PaymentUtils';
import bankAccountPropTypes from '../../../components/bankAccountPropTypes';

const MENU_ITEM = 'menuItem';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** Whether to show selection checkboxes */
    enableSelection: PropTypes.bool,

    /** Type to filter the payment Method list */
    filterType: PropTypes.oneOf([CONST.PAYMENT_METHODS.DEBIT_CARD, CONST.PAYMENT_METHODS.BANK_ACCOUNT, '']),

    /** Selected Account ID if selection is active */
    selectedAccountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

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
    enableSelection: false,
    selectedAccountID: '',
    filterType: '',
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.createPaymentMethodList = this.createPaymentMethodList.bind(this);
    }

    /**
     * Take all of the different payment methods and create a list that can be easily digested by renderItem
     * @returns {Array}
     */
    createPaymentMethodList() {
        let paymentMethods = PaymentUtils.getPaymentMethods(this.props.bankAccountList, this.props.cardList, this.props.payPalMeUsername);

        if (!_.isEmpty(this.props.filterType)) {
            paymentMethods = _.filter(paymentMethods, paymentMethod => paymentMethod.type === this.props.filterType);
        }

        paymentMethods = _.map(paymentMethods, method => ({
            ...method,
            ...PaymentUtils.getPaymentMethodIconProperties(method),
            type: MENU_ITEM,
            onPress: () => this.props.onPress(method.id),
        }));

        // If we have not added any payment methods, show a default empty state
        if (_.isEmpty(paymentMethods)) {
            paymentMethods.push({
                text: this.props.translate('paymentMethodList.addFirstPaymentMethod'),
            });
        }

        return paymentMethods;
    }

    /**
     * Create a menuItem for each passed paymentMethod
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @returns {React.Component}
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
                    shouldShowSelectedState={this.props.enableSelection}
                    isSelected={this.props.selectedAccountID === item.id}
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
