import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import MenuItem from '../../../components/MenuItem';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import bankAccountPropTypes from '../../../components/bankAccountPropTypes';
import paypalMeDataPropTypes from '../../../components/paypalMeDataPropTypes';
import cardPropTypes from '../../../components/cardPropTypes';
import * as PaymentUtils from '../../../libs/PaymentUtils';
import FormAlertWrapper from '../../../components/FormAlertWrapper';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import Log from '../../../libs/Log';

const MENU_ITEM = 'menuItem';
const BUTTON = 'button';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Account details for PayPal.Me */
    payPalMeData: paypalMeDataPropTypes,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

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
    payPalMeData: {},
    bankAccountList: {},
    cardList: {},
    userWallet: {
        walletLinkedAccountID: 0,
        walletLinkedAccountType: '',
    },
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
        // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
        const filteredCardList = _.filter(this.props.cardList, card => card.accountData.additionalData.isP2PDebitCard);
        let combinedPaymentMethods = PaymentUtils.formatPaymentMethods(this.props.bankAccountList, filteredCardList, this.props.payPalMeData);

        if (!_.isEmpty(this.props.filterType)) {
            combinedPaymentMethods = _.filter(combinedPaymentMethods, paymentMethod => paymentMethod.accountType === this.props.filterType);
        }

        combinedPaymentMethods = _.map(combinedPaymentMethods, paymentMethod => ({
            ...paymentMethod,
            type: MENU_ITEM,
            onPress: e => this.props.onPress(e, paymentMethod.accountType, paymentMethod.accountData, paymentMethod.isDefault, paymentMethod.methodID),
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
            type: BUTTON,
            text: this.props.translate('paymentMethodList.addPaymentMethod'),
            icon: Expensicons.CreditCard,
            style: [styles.buttonCTA],
            iconStyles: [styles.buttonCTAIcon],
            onPress: e => this.props.onPress(e),
            isDisabled: this.props.isLoadingPayments,
            shouldShowRightIcon: true,
            success: true,
            key: 'addPaymentMethodButton',
        });

        return combinedPaymentMethods;
    }

    /**
     * Dismisses the error on the payment method
     * @param {Object} item
     */
    dismissError(item) {
        const paymentList = item.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.CARD_LIST;
        const paymentID = item.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? lodashGet(item, ['accountData', 'bankAccountID'], '') : lodashGet(item, ['accountData', 'fundID'], '');

        if (!paymentID) {
            Log.info('Unable to clear payment method error: ', item);
            return;
        }

        if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            PaymentMethods.clearDeletePaymentMethodError(paymentList, paymentID);
        } else {
            PaymentMethods.clearAddPaymentMethodError(paymentList, paymentID);
        }
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
                <OfflineWithFeedback
                    onClose={() => this.dismissError(item)}
                    pendingAction={item.pendingAction}
                    errors={item.errors}
                    errorRowStyles={styles.ph6}
                >
                    <MenuItem
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
                </OfflineWithFeedback>
            );
        }
        if (item.type === BUTTON) {
            return (
                <FormAlertWrapper>
                    {isOffline => (
                        <Button
                            text={item.text}
                            icon={item.icon}
                            onPress={item.onPress}
                            isDisabled={item.isDisabled || isOffline}
                            style={item.style}
                            iconStyles={item.iconStyles}
                            success={item.success}
                            shouldShowRightIcon={item.shouldShowRightIcon}
                            large
                        />
                    )}
                </FormAlertWrapper>
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
        payPalMeData: {
            key: ONYXKEYS.NVP_PAYPAL,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(PaymentMethodList);
