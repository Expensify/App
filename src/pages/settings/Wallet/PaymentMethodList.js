import {FlashList} from '@shopify/flash-list';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import bankAccountPropTypes from '@components/bankAccountPropTypes';
import Button from '@components/Button';
import cardPropTypes from '@components/cardPropTypes';
import FormAlertWrapper from '@components/FormAlertWrapper';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as CardUtils from '@libs/CardUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import stylePropTypes from '@styles/stylePropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import assignedCardPropTypes from './assignedCardPropTypes';

const propTypes = {
    /** What to do when a menu item is pressed */
    onPress: PropTypes.func.isRequired,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of assigned cards */
    cardList: PropTypes.objectOf(assignedCardPropTypes),

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Whether the add bank account button should be shown on the list */
    shouldShowAddBankAccount: PropTypes.bool,

    /** Whether the add Payment button be shown on the list */
    shouldShowAddPaymentMethodButton: PropTypes.bool,

    /** Whether the assigned cards should be shown on the list */
    shouldShowAssignedCards: PropTypes.bool,

    /** Whether the empty list message should be shown when the list is empty */
    shouldShowEmptyListMessage: PropTypes.bool,

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

    /** Should menu items be selectable with a checkbox */
    shouldShowSelectedState: PropTypes.bool,

    /** React ref being forwarded to the PaymentMethodList Button */
    buttonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    /** To enable/disable scrolling */
    shouldEnableScroll: PropTypes.bool,

    /** List container style */
    style: stylePropTypes,
};

const defaultProps = {
    bankAccountList: {},
    cardList: {},
    fundList: null,
    userWallet: {
        walletLinkedAccountID: 0,
        walletLinkedAccountType: '',
    },
    isLoadingPaymentMethods: true,
    shouldShowAddBankAccount: true,
    shouldShowAddPaymentMethodButton: true,
    shouldShowAssignedCards: false,
    shouldShowEmptyListMessage: true,
    filterType: '',
    actionPaymentMethodType: '',
    activePaymentMethodID: '',
    selectedMethodID: '',
    listHeaderComponent: null,
    buttonRef: () => {},
    onListContentSizeChange: () => {},
    shouldEnableScroll: true,
    style: {},
    shouldShowSelectedState: false,
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

/**
 * @param {Object} item
 * @returns {String}
 */
function keyExtractor(item) {
    return item.key;
}

function PaymentMethodList({
    actionPaymentMethodType,
    activePaymentMethodID,
    bankAccountList,
    buttonRef,
    cardList,
    fundList,
    filterType,
    isLoadingPaymentMethods,
    onPress,
    shouldShowSelectedState,
    shouldShowAddPaymentMethodButton,
    shouldShowAddBankAccount,
    shouldShowEmptyListMessage,
    shouldShowAssignedCards,
    selectedMethodID,
    listHeaderComponent,
    onListContentSizeChange,
    shouldEnableScroll,
    style,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const filteredPaymentMethods = useMemo(() => {
        if (shouldShowAssignedCards) {
            const assignedCards = _.chain(cardList)
                // Filter by physical, active cards associated with a domain
                .filter((card) => !card.isVirtual && card.domainName && CONST.EXPENSIFY_CARD.ACTIVE_STATES.includes(card.state))
                .sortBy((card) => !CardUtils.isExpensifyCard(card.cardID))
                .value();

            const numberPhysicalExpensifyCards = _.filter(assignedCards, (card) => CardUtils.isExpensifyCard(card.cardID)).length;

            return _.map(assignedCards, (card) => {
                const isExpensifyCard = CardUtils.isExpensifyCard(card.cardID);
                const icon = getBankIcon(card.bank, true);

                // In the case a user has been assigned multiple physical Expensify Cards under one domain, display the Card with PAN
                const expensifyCardDescription = numberPhysicalExpensifyCards > 1 ? CardUtils.getCardDescription(card.cardID) : translate('walletPage.expensifyCard');
                return {
                    key: card.cardID,
                    title: isExpensifyCard ? expensifyCardDescription : card.cardName,
                    description: card.domainName,
                    onPress: isExpensifyCard ? () => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(card.domainName)) : () => {},
                    shouldShowRightIcon: isExpensifyCard,
                    interactive: isExpensifyCard,
                    canDismissError: isExpensifyCard,
                    errors: card.errors,
                    brickRoadIndicator: card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN || card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL ? 'error' : null,
                    ...icon,
                };
            });
        }

        const paymentCardList = fundList || {};

        // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
        const filteredCardList = _.filter(paymentCardList, (card) => card.accountData.additionalData.isP2PDebitCard);
        let combinedPaymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList, filteredCardList);

        if (!_.isEmpty(filterType)) {
            combinedPaymentMethods = _.filter(combinedPaymentMethods, (paymentMethod) => paymentMethod.accountType === filterType);
        }

        if (!isOffline) {
            combinedPaymentMethods = _.filter(
                combinedPaymentMethods,
                (paymentMethod) => paymentMethod.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !_.isEmpty(paymentMethod.errors),
            );
        }

        combinedPaymentMethods = _.map(combinedPaymentMethods, (paymentMethod) => {
            const isMethodActive = isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod);

            return {
                ...paymentMethod,
                onPress: (e) => onPress(e, paymentMethod.accountType, paymentMethod.accountData, paymentMethod.isDefault, paymentMethod.methodID),
                iconFill: isMethodActive ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED) : null,
                wrapperStyle: isMethodActive ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : null,
                disabled: paymentMethod.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
        });

        return combinedPaymentMethods;
    }, [shouldShowAssignedCards, fundList, bankAccountList, filterType, isOffline, cardList, translate, actionPaymentMethodType, activePaymentMethodID, onPress]);

    /**
     * Render placeholder when there are no payments methods
     *
     * @return {React.Component}
     */
    const renderListEmptyComponent = () => <Text style={styles.popoverMenuItem}>{translate('paymentMethodList.addFirstPaymentMethod')}</Text>;

    const renderListFooterComponent = useCallback(
        () => (
            <MenuItem
                onPress={onPress}
                title={translate('walletPage.addBankAccount')}
                icon={Expensicons.Plus}
                wrapperStyle={styles.paymentMethod}
            />
        ),

        [onPress, styles.paymentMethod, translate],
    );

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
                canDismissError={item.canDismissError}
            >
                <MenuItem
                    onPress={item.onPress}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    disabled={item.disabled}
                    iconFill={item.iconFill}
                    iconHeight={item.iconHeight || item.iconSize}
                    iconWidth={item.iconWidth || item.iconSize}
                    iconStyles={item.iconStyles}
                    badgeText={shouldShowDefaultBadge(filteredPaymentMethods, item.isDefault) ? translate('paymentMethodList.defaultPaymentMethod') : null}
                    wrapperStyle={styles.paymentMethod}
                    shouldShowRightIcon={item.shouldShowRightIcon}
                    shouldShowSelectedState={shouldShowSelectedState}
                    isSelected={selectedMethodID === item.methodID}
                    interactive={item.interactive}
                    brickRoadIndicator={item.brickRoadIndicator}
                />
            </OfflineWithFeedback>
        ),

        [styles.ph6, styles.paymentMethod, filteredPaymentMethods, translate, shouldShowSelectedState, selectedMethodID],
    );

    return (
        <>
            <View style={[style, {minHeight: variables.optionRowHeight}]}>
                <FlashList
                    estimatedItemSize={variables.optionRowHeight}
                    data={filteredPaymentMethods}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={shouldShowEmptyListMessage ? renderListEmptyComponent : null}
                    ListHeaderComponent={listHeaderComponent}
                    ListFooterComponent={shouldShowAddBankAccount ? renderListFooterComponent : null}
                    onContentSizeChange={onListContentSizeChange}
                    scrollEnabled={shouldEnableScroll}
                />
            </View>
            {shouldShowAddPaymentMethodButton && (
                <FormAlertWrapper>
                    {(isFormOffline) => (
                        <Button
                            text={translate('paymentMethodList.addPaymentMethod')}
                            icon={Expensicons.CreditCard}
                            onPress={onPress}
                            isDisabled={isLoadingPaymentMethods || isFormOffline}
                            style={[styles.mh4, styles.buttonCTA]}
                            iconStyles={[styles.buttonCTAIcon]}
                            key="addPaymentMethodButton"
                            success
                            shouldShowRightIcon
                            large
                            ref={buttonRef}
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

export default withOnyx({
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    fundList: {
        key: ONYXKEYS.FUND_LIST,
    },
    isLoadingPaymentMethods: {
        key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(PaymentMethodList);
