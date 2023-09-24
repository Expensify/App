import _ from 'underscore';
import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {withNetwork} from '../../../components/OnyxProvider';
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

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Account details for PayPal.Me */
    payPalMeData: paypalMeDataPropTypes,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Whether the add Payment button be shown on the list */
    shouldShowAddPaymentMethodButton: PropTypes.bool,

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

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

    /** Callback for whenever FlatList component size changes */
    onListContentSizeChange: PropTypes.func,

    /** React ref being forwarded to the PaymentMethodList Button */
    buttonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeData: {},
    bankAccountList: {},
    fundList: null,
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
    buttonRef: () => {},
    onListContentSizeChange: () => {},
};

/**
 * Dismisses the error on the payment method
 * @param {Object} item
 */
function dismissError(item) {
    const isBankAccount = item.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT;
    const paymentList = isBankAccount ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST;
    const paymentID = isBankAccount ? lodashGet(item, ['accountData', 'bankAccountID'], '') : lodashGet(item, ['accountData', 'fundID'], '');

    if (!paymentID) {
        Log.info('Unable to clear payment method error: ', item);
        return;
    }

    if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        PaymentMethods.clearDeletePaymentMethodError(paymentList, paymentID);
        if (!isBankAccount) {
            PaymentMethods.clearDeletePaymentMethodError(ONYXKEYS.FUND_LIST, paymentID);
        }
    } else {
        PaymentMethods.clearAddPaymentMethodError(paymentList, paymentID);
        if (!isBankAccount) {
            PaymentMethods.clearAddPaymentMethodError(ONYXKEYS.FUND_LIST, paymentID);
        }
    }
}

/**
 * @param {Array} filteredPaymentMethods
 * @param {Boolean} isDefault
 * @returns {Boolean}
 */
function shouldShowDefaultBadge(filteredPaymentMethods, isDefault = false) {
    if (!isDefault) {
        return false;
    }

    const defaultablePaymentMethodCount = _.filter(
        filteredPaymentMethods,
        (method) => method.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT || method.accountType === CONST.PAYMENT_METHODS.DEBIT_CARD,
    ).length;
    return defaultablePaymentMethodCount > 1;
}

/**
 * @param {String} actionPaymentMethodType
 * @param {String|Number} activePaymentMethodID
 * @param {String} paymentMethod
 * @return {Boolean}
 */
function isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod) {
    return paymentMethod.accountType === actionPaymentMethodType && paymentMethod.methodID === activePaymentMethodID;
}
function PaymentMethodList(props) {
    const {actionPaymentMethodType, activePaymentMethodID, bankAccountList, fundList, filterType, network, onPress, payPalMeData, shouldShowSelectedState, selectedMethodID, translate} =
        props;

    const filteredPaymentMethods = useMemo(() => {
        const paymentCardList = fundList || {};
        // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
        const filteredCardList = _.filter(paymentCardList, (card) => card.accountData.additionalData.isP2PDebitCard);
        let combinedPaymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList, filteredCardList, payPalMeData);

        if (!_.isEmpty(filterType)) {
            combinedPaymentMethods = _.filter(combinedPaymentMethods, (paymentMethod) => paymentMethod.accountType === filterType);
        }

        if (!network.isOffline) {
            combinedPaymentMethods = _.filter(
                combinedPaymentMethods,
                (paymentMethod) => paymentMethod.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !_.isEmpty(paymentMethod.errors),
            );
        }

        combinedPaymentMethods = _.map(combinedPaymentMethods, (paymentMethod) => ({
            ...paymentMethod,
            onPress: (e) => onPress(e, paymentMethod.accountType, paymentMethod.accountData, paymentMethod.isDefault, paymentMethod.methodID),
            iconFill: isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod) ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
            wrapperStyle: isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod)
                ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)]
                : null,
            disabled: paymentMethod.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        }));

        return combinedPaymentMethods;
    }, [actionPaymentMethodType, activePaymentMethodID, bankAccountList, filterType, network, onPress, payPalMeData, fundList]);

    /**
     * Render placeholder when there are no payments methods
     *
     * @return {React.Component}
     */
    const renderListEmptyComponent = useCallback(() => <Text style={[styles.popoverMenuItem]}>{translate('paymentMethodList.addFirstPaymentMethod')}</Text>, [translate]);

    /**
     * Create a menuItem for each passed paymentMethod
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {React.Component}
     */
    const renderItem = useCallback(
        ({item}) => (
            <OfflineWithFeedback
                onClose={() => dismissError(item)}
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
                    badgeText={shouldShowDefaultBadge(filteredPaymentMethods, item.isDefault) ? translate('paymentMethodList.defaultPaymentMethod') : null}
                    wrapperStyle={item.wrapperStyle}
                    shouldShowSelectedState={shouldShowSelectedState}
                    isSelected={selectedMethodID === item.methodID}
                />
            </OfflineWithFeedback>
        ),
        [shouldShowSelectedState, selectedMethodID, filteredPaymentMethods, translate],
    );

    return (
        <>
            <FlatList
                data={filteredPaymentMethods}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                ListEmptyComponent={renderListEmptyComponent(translate)}
                ListHeaderComponent={props.listHeaderComponent}
                onContentSizeChange={props.onListContentSizeChange}
            />
            {props.shouldShowAddPaymentMethodButton && (
                <FormAlertWrapper>
                    {(isOffline) => (
                        <Button
                            text={translate('paymentMethodList.addPaymentMethod')}
                            icon={Expensicons.CreditCard}
                            onPress={props.onPress}
                            isDisabled={props.isLoadingPaymentMethods || isOffline}
                            style={[styles.mh4, styles.buttonCTA]}
                            iconStyles={[styles.buttonCTAIcon]}
                            key="addPaymentMethodButton"
                            success
                            shouldShowRightIcon
                            large
                            ref={props.buttonRef}
                        />
                    )}
                </FormAlertWrapper>
            )}
        </>
    );
}

PaymentMethodList.propTypes = propTypes;
PaymentMethodList.defaultProps = defaultProps;
PaymentMethodList.displayName = 'PaymentMethodList';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        fundList: {
            key: ONYXKEYS.FUND_LIST,
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
