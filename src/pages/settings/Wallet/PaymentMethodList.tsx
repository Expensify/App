import lodashSortBy from 'lodash/sortBy';
import type {ReactElement, Ref} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {FlatList, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg/lib/typescript/ReactNativeSVG';
import type {ValueOf} from 'type-fest';
import type {RenderSuggestionMenuItemProps} from '@components/AutoCompleteSuggestions/types';
import Button from '@components/Button';
import FormAlertWrapper from '@components/FormAlertWrapper';
import getBankIcon from '@components/Icon/BankIcons';
import type {BankName} from '@components/Icon/BankIconsUtils';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, BankAccountList, CardList, FundList} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {FilterMethodPaymentType} from '@src/types/onyx/WalletTransfer';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {FormattedSelectedPaymentMethodIcon} from './WalletPage/types';

type PaymentMethodListOnyxProps = {
    /** List of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** List of assigned cards */
    cardList: OnyxEntry<CardList>;

    /** List of user's cards */
    fundList: OnyxEntry<FundList>;

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: OnyxEntry<boolean>;
};

type PaymentMethodListProps = PaymentMethodListOnyxProps & {
    /** Type of active/highlighted payment method */
    actionPaymentMethodType?: string;

    /** ID of active/highlighted payment method */
    activePaymentMethodID?: string | number;

    /** ID of selected payment method */
    selectedMethodID?: string | number;

    /** Content for the FlatList header component */
    listHeaderComponent?: ReactElement;

    /** Callback for whenever FlatList component size changes */
    onListContentSizeChange?: () => void;

    /** Should menu items be selectable with a checkbox */
    shouldShowSelectedState?: boolean;

    /** React ref being forwarded to the PaymentMethodList Button */
    buttonRef?: Ref<View>;

    /** To enable/disable scrolling */
    shouldEnableScroll?: boolean;

    /** List container style */
    style?: StyleProp<ViewStyle>;

    /** List item style */
    listItemStyle?: StyleProp<ViewStyle>;

    /** Type to filter the payment Method list */
    filterType?: FilterMethodPaymentType;

    /** Whether the add bank account button should be shown on the list */
    shouldShowAddBankAccount?: boolean;

    /** Whether the add Payment button be shown on the list */
    shouldShowAddPaymentMethodButton?: boolean;

    /** Whether the assigned cards should be shown on the list */
    shouldShowAssignedCards?: boolean;

    /** Whether the empty list message should be shown when the list is empty */
    shouldShowEmptyListMessage?: boolean;

    /** Whether the right icon should be shown in PaymentMethodItem */
    shouldShowRightIcon?: boolean;

    /** What to do when a menu item is pressed */
    onPress: (
        event?: GestureResponderEvent | KeyboardEvent,
        accountType?: string,
        accountData?: AccountData,
        icon?: FormattedSelectedPaymentMethodIcon,
        isDefault?: boolean,
        methodID?: number,
    ) => void;
};

type PaymentMethodItem = PaymentMethod & {
    key?: string;
    title?: string;
    description: string;
    onPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;
    canDismissError?: boolean;
    disabled?: boolean;
    shouldShowRightIcon?: boolean;
    interactive?: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    errors?: Errors;
    iconRight?: React.FC<SvgProps>;
    isMethodActive?: boolean;
} & BankIcon;

function dismissError(item: PaymentMethod) {
    const isBankAccount = item.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;
    const paymentList = isBankAccount ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST;
    const paymentID = isBankAccount ? item.accountData?.bankAccountID ?? '' : item.accountData?.fundID ?? '';

    if (!paymentID) {
        Log.info('Unable to clear payment method error: ', undefined, item);
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

function shouldShowDefaultBadge(filteredPaymentMethods: PaymentMethod[], isDefault = false): boolean {
    if (!isDefault) {
        return false;
    }

    const defaultablePaymentMethodCount = filteredPaymentMethods.filter(
        (method) => method.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || method.accountType === CONST.PAYMENT_METHODS.DEBIT_CARD,
    ).length;
    return defaultablePaymentMethodCount > 1;
}

function isPaymentMethodActive(actionPaymentMethodType: string, activePaymentMethodID: string | number, paymentMethod: PaymentMethod) {
    return paymentMethod.accountType === actionPaymentMethodType && paymentMethod.methodID === activePaymentMethodID;
}

function keyExtractor(item: PaymentMethod) {
    return item.key ?? '';
}

function PaymentMethodList({
    actionPaymentMethodType = '',
    activePaymentMethodID = '',
    bankAccountList = {},
    buttonRef = () => {},
    cardList = {},
    fundList = {},
    filterType = '',
    listHeaderComponent,
    isLoadingPaymentMethods = true,
    onPress,
    shouldShowSelectedState = false,
    shouldShowAddPaymentMethodButton = true,
    shouldShowAddBankAccount = true,
    shouldShowEmptyListMessage = true,
    shouldShowAssignedCards = false,
    selectedMethodID = '',
    onListContentSizeChange = () => {},
    shouldEnableScroll = true,
    style = {},
    listItemStyle = {},
    shouldShowRightIcon = true,
}: PaymentMethodListProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const filteredPaymentMethods = useMemo(() => {
        if (shouldShowAssignedCards) {
            const assignedCards = Object.values(cardList ?? {})
                // Filter by physical, active cards associated with a domain
                .filter((card) => !card.nameValuePairs?.isVirtual && !!card.domainName && CONST.EXPENSIFY_CARD.ACTIVE_STATES.includes(card.state ?? 0));

            const numberPhysicalExpensifyCards = assignedCards.filter((card) => CardUtils.isExpensifyCard(card.cardID)).length;

            const assignedCardsSorted = lodashSortBy(assignedCards, (card) => !CardUtils.isExpensifyCard(card.cardID));

            return assignedCardsSorted.map((card) => {
                const isExpensifyCard = CardUtils.isExpensifyCard(card.cardID);
                const icon = getBankIcon({bankName: card.bank as BankName, isCard: true, styles});

                // In the case a user has been assigned multiple physical Expensify Cards under one domain, display the Card with PAN
                const expensifyCardDescription = numberPhysicalExpensifyCards > 1 ? CardUtils.getCardDescription(card.cardID) : translate('walletPage.expensifyCard');
                const cartTitle = card.lastFourPAN ? `${card.bank} - ${card.lastFourPAN}` : card.bank;
                return {
                    key: card.cardID.toString(),
                    title: isExpensifyCard ? expensifyCardDescription : cartTitle,
                    description: card.domainName,
                    onPress: isExpensifyCard ? () => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(card.domainName ?? '')) : () => {},
                    shouldShowRightIcon: isExpensifyCard,
                    interactive: isExpensifyCard,
                    canDismissError: isExpensifyCard,
                    errors: card.errors,
                    brickRoadIndicator:
                        card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN || card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL
                            ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                            : undefined,
                    ...icon,
                };
            });
        }

        const paymentCardList = fundList ?? {};

        // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
        const filteredCardList = Object.values(paymentCardList).filter((card) => !!card.accountData?.additionalData?.isP2PDebitCard);
        let combinedPaymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, filteredCardList, styles);

        if (filterType !== '') {
            combinedPaymentMethods = combinedPaymentMethods.filter((paymentMethod) => paymentMethod.accountType === filterType);
        }

        if (!isOffline) {
            combinedPaymentMethods = combinedPaymentMethods.filter(
                (paymentMethod) => paymentMethod.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(paymentMethod.errors),
            );
        }
        combinedPaymentMethods = combinedPaymentMethods.map((paymentMethod) => {
            const isMethodActive = isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod);
            return {
                ...paymentMethod,
                onPress: (e: GestureResponderEvent) =>
                    onPress(
                        e,
                        paymentMethod.accountType,
                        paymentMethod.accountData,
                        {
                            icon: paymentMethod.icon,
                            iconHeight: paymentMethod?.iconHeight,
                            iconWidth: paymentMethod?.iconWidth,
                            iconStyles: paymentMethod?.iconStyles,
                            iconSize: paymentMethod?.iconSize,
                        },
                        paymentMethod.isDefault,
                        paymentMethod.methodID,
                    ),
                wrapperStyle: isMethodActive ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)] : null,
                disabled: paymentMethod.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isMethodActive,
                iconRight: Expensicons.ThreeDots,
                shouldShowRightIcon,
            };
        });

        return combinedPaymentMethods;
    }, [
        shouldShowAssignedCards,
        fundList,
        bankAccountList,
        styles,
        filterType,
        isOffline,
        cardList,
        translate,
        actionPaymentMethodType,
        activePaymentMethodID,
        StyleUtils,
        shouldShowRightIcon,
        onPress,
    ]);

    /**
     * Render placeholder when there are no payments methods
     */
    const renderListEmptyComponent = () => <Text style={styles.popoverMenuItem}>{translate('paymentMethodList.addFirstPaymentMethod')}</Text>;

    const renderListFooterComponent = useCallback(
        () => (
            <MenuItem
                onPress={onPress}
                title={translate('walletPage.addBankAccount')}
                icon={Expensicons.Plus}
                wrapperStyle={[styles.paymentMethod, listItemStyle]}
                hoverAndPressStyle={styles.hoveredComponentBG}
                ref={buttonRef}
            />
        ),

        [onPress, translate, styles.paymentMethod, styles.hoveredComponentBG, listItemStyle, buttonRef],
    );

    /**
     * Create a menuItem for each passed paymentMethod
     */
    const renderItem = useCallback(
        ({item}: RenderSuggestionMenuItemProps<PaymentMethodItem>) => (
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
                    displayInDefaultIconColor
                    iconHeight={item.iconHeight ?? item.iconSize}
                    iconWidth={item.iconWidth ?? item.iconSize}
                    iconStyles={item.iconStyles}
                    badgeText={shouldShowDefaultBadge(filteredPaymentMethods, item.isDefault) ? translate('paymentMethodList.defaultPaymentMethod') : undefined}
                    wrapperStyle={[styles.paymentMethod, listItemStyle]}
                    iconRight={item.iconRight}
                    badgeStyle={styles.badgeBordered}
                    hoverAndPressStyle={styles.hoveredComponentBG}
                    shouldShowRightIcon={item.shouldShowRightIcon}
                    shouldShowSelectedState={shouldShowSelectedState}
                    isSelected={selectedMethodID.toString() === item.methodID?.toString()}
                    interactive={item.interactive}
                    brickRoadIndicator={item.brickRoadIndicator}
                    success={item.isMethodActive}
                />
            </OfflineWithFeedback>
        ),

        [styles.ph6, styles.paymentMethod, styles.badgeBordered, styles.hoveredComponentBG, filteredPaymentMethods, translate, listItemStyle, shouldShowSelectedState, selectedMethodID],
    );

    return (
        <>
            <View style={[style, {minHeight: (filteredPaymentMethods.length + (shouldShowAddBankAccount ? 1 : 0)) * variables.optionRowHeight}]}>
                <FlatList
                    data={filteredPaymentMethods}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={shouldShowEmptyListMessage ? renderListEmptyComponent : null}
                    ListHeaderComponent={listHeaderComponent}
                    onContentSizeChange={onListContentSizeChange}
                    scrollEnabled={shouldEnableScroll}
                />
                {shouldShowAddBankAccount && renderListFooterComponent()}
            </View>
            {shouldShowAddPaymentMethodButton && (
                <FormAlertWrapper>
                    {(isFormOffline) => (
                        <Button
                            text={translate('paymentMethodList.addPaymentMethod')}
                            icon={Expensicons.CreditCard}
                            onPress={onPress}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            isDisabled={isLoadingPaymentMethods || isFormOffline}
                            style={[styles.mh4, styles.buttonCTA]}
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

PaymentMethodList.displayName = 'PaymentMethodList';

export default withOnyx<PaymentMethodListProps, PaymentMethodListOnyxProps>({
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
})(PaymentMethodList);
