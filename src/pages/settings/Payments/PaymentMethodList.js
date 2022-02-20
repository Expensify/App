import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import MenuItem from '../../../components/MenuItem';
import Text from '../../../components/Text';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import bankAccountPropTypes from '../../../components/bankAccountPropTypes';
import * as PaymentUtils from '../../../libs/PaymentUtils';

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

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc */
        cardName: PropTypes.string,

        /** The masked credit card number */
        cardNumber: PropTypes.string,

        /** The ID of the card in the cards DB */
        cardID: PropTypes.number,
    })),

    /** Whether the add Payment button be shown on the list */
    shouldShowAddPaymentMethodButton: PropTypes.bool,

    /** Type to filter the payment Method list */
    filterType: PropTypes.oneOf([CONST.PAYMENT_METHODS.DEBIT_CARD, CONST.PAYMENT_METHODS.BANK_ACCOUNT, '']),

    /** User wallet props */
    userWallet: PropTypes.shape({
        /** The ID of the linked account */
        walletLinkedAccountID: PropTypes.number,

        /** The type of the linked account (debitCard or bankAccount) */
        walletLinkedAccountType: PropTypes.string,
    }),

    /** Type of active/highlighted payment method */
    actionPaymentMethodType: PropTypes.oneOf([..._.values(CONST.PAYMENT_METHODS), '']),

    /** ID of active/highlighted payment method */
    activePaymentMethodID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** ID of selected payment method */
    selectedMethodID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
    bankAccountList: {},
    cardList: {},
    userWallet: {
        walletLinkedAccountID: 0,
        walletLinkedAccountType: '',
    },
    isLoadingPayments: false,
    isAddPaymentMenuActive: false,
    shouldShowAddPaymentMethodButton: true,
    filterType: '',
    actionPaymentMethodType: '',
    activePaymentMethodID: '',
    selectedMethodID: '',
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    /**
     * @param {Boolean} isDefault
     * @returns {*}
     */
    getDefaultBadgeText(isDefault = false) {
        if (!isDefault) {
            return null;
        }

        const defaultablePaymentMethodCount = _.reduce(this.getFilteredPaymentMethods(), (count, method) => (
            (method.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT || method.accountType === CONST.PAYMENT_METHODS.DEBIT_CARD)
                ? count + 1
                : count
        ), 0);
        if (defaultablePaymentMethodCount <= 1) {
            return null;
        }

        return this.props.translate('paymentMethodList.defaultPaymentMethod');
    }

    /**
     * @returns {Array}
     */
    getFilteredPaymentMethods() {
        let combinedPaymentMethods = PaymentUtils.formatPaymentMethods(this.props.bankAccountList, this.props.cardList, this.props.payPalMeUsername, this.props.userWallet);

        if (!_.isEmpty(this.props.filterType)) {
            combinedPaymentMethods = _.filter(combinedPaymentMethods, paymentMethod => paymentMethod.accountType === this.props.filterType);
        }

        combinedPaymentMethods = _.map(combinedPaymentMethods, paymentMethod => ({
            ...paymentMethod,
            type: MENU_ITEM,
            onPress: e => this.props.onPress(e, paymentMethod.accountType, paymentMethod.accountData),
            iconFill: this.isPaymentMethodActive(paymentMethod) ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
            wrapperStyle: this.isPaymentMethodActive(paymentMethod) ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : null,
        }));

        return combinedPaymentMethods;
    }

    /**
     * Take all of the different payment methods and create a list that can be easily digested by renderItem
     *
     * @returns {Array}
     */
    createPaymentMethodList() {
        const combinedPaymentMethods = this.getFilteredPaymentMethods();

        // If we have not added any payment methods, show a default empty state
        if (_.isEmpty(combinedPaymentMethods)) {
            combinedPaymentMethods.push({
                key: 'addFirstPaymentMethodHelpText',
                text: this.props.translate('paymentMethodList.addFirstPaymentMethod'),
            });
        }

        if (!this.props.shouldShowAddPaymentMethodButton) {
            return combinedPaymentMethods;
        }

        combinedPaymentMethods.push({
            ref: this.props.addPaymentMethodButtonRef,
            type: MENU_ITEM,
            title: this.props.translate('paymentMethodList.addPaymentMethod'),
            icon: Expensicons.Plus,
            onPress: e => this.props.onPress(e),
            key: 'addPaymentMethodButton',
            disabled: this.props.isLoadingPayments,
            iconFill: this.props.isAddPaymentMenuActive ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
            wrapperStyle: this.props.isAddPaymentMenuActive ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : [],
        });

        return combinedPaymentMethods;
    }

    /**
     * @param {Object} paymentMethod
     * @param {String|Number} paymentMethod.methodID
     * @param {String} paymentMethod.accountType
     * @return {Boolean}
     */
    isPaymentMethodActive(paymentMethod) {
        return paymentMethod.accountType === this.props.actionPaymentMethodType && paymentMethod.methodID === this.props.activePaymentMethodID;
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
                    ref={item.ref}
                    onPress={item.onPress}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    disabled={item.disabled}
                    iconFill={item.iconFill}
                    iconHeight={item.iconSize}
                    iconWidth={item.iconSize}
                    badgeText={this.getDefaultBadgeText(item.isDefault)}
                    wrapperStyle={item.wrapperStyle}
                    shouldShowSelectedState={this.props.shouldShowSelectedState}
                    isSelected={this.props.selectedMethodID === item.methodID}
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
                keyExtractor={item => item.key}
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
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(PaymentMethodList);
