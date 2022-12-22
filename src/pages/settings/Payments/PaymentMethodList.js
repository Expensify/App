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
import {withNetwork} from '../../../components/OnyxProvider';
import * as Expensicons from '../../../components/Icon/Expensicons';
import bankAccountPropTypes from '../../../components/bankAccountPropTypes';
import paypalMeDataPropTypes from '../../../components/paypalMeDataPropTypes';
import cardPropTypes from '../../../components/cardPropTypes';
import * as PaymentUtils from '../../../libs/PaymentUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import Log from '../../../libs/Log';

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

    /** Content for the FlatList header component */
    listHeaderComponent: PropTypes.func,

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
    isLoadingPaymentMethods: true,
    shouldShowAddPaymentMethodButton: true,
    filterType: '',
    actionPaymentMethodType: '',
    activePaymentMethodID: '',
    selectedMethodID: '',
    listHeaderComponent: null,
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
            onPress: e => this.props.onPress(e, paymentMethod.accountType, paymentMethod.accountData, paymentMethod.isDefault, paymentMethod.methodID),
            iconFill: this.isPaymentMethodActive(paymentMethod) ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
            wrapperStyle: this.isPaymentMethodActive(paymentMethod) ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : null,
        }));

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

    /**
     * Show add first payment copy when payment methods are
     *
     * @return {React.Component}
     */
    renderListEmptyComponent() {
        return (
            <Text
                style={[styles.popoverMenuItem]}
            >
                {this.props.translate('paymentMethodList.addFirstPaymentMethod')}
            </Text>
        );
    }

    render() {
        return (
            <>
                <FlatList
                    data={this.getFilteredPaymentMethods()}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.key}
                    ListEmptyComponent={this.renderListEmptyComponent()}
                    ListHeaderComponent={this.props.listHeaderComponent}
                />
                {this.props.shouldShowAddPaymentMethodButton && (
                    <Button
                        text={this.props.translate('paymentMethodList.addPaymentMethod')}
                        icon={Expensicons.CreditCard}
                        onPress={e => this.props.onPress(e)}
                        isDisabled={this.props.network.isOffline}
                        style={[styles.mh4, styles.buttonCTA]}
                        iconStyles={[styles.buttonCTAIcon]}
                        key="addPaymentMethodButton"
                        success
                        shouldShowRightIcon
                        large
                    />
                )}
            </>
        );
    }
}

PaymentMethodList.propTypes = propTypes;
PaymentMethodList.defaultProps = defaultProps;

export default compose(
    withNetwork(),
    withLocalize,
    withOnyx({
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
        },
        payPalMeData: {
            key: ONYXKEYS.PAYPAL,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(PaymentMethodList);
