import {isUserValidatedSelector} from '@selectors/Account';
import {FlashList} from '@shopify/flash-list';
import lodashSortBy from 'lodash/sortBy';
import type {ReactElement} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {RenderSuggestionMenuItemProps} from '@components/AutoCompleteSuggestions/types';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Text from '@components/Text';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    filterPersonalCards,
    getAssignedCardSortKey,
    getCardFeedIcon,
    getCompanyCardFeedWithDomainID,
    getPlaidInstitutionIconUrl,
    isExpensifyCard,
    isExpensifyCardPendingAction,
    lastFourNumbersFromCardName,
    maskCardNumber,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccount, BankAccountList, CardList, CompanyCardFeed} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {PaymentMethodItem} from './PaymentMethodListItem';
import PaymentMethodListItem from './PaymentMethodListItem';
import type {CardPressHandlerParams, PaymentMethodPressHandlerParams} from './WalletPage/types';

type PaymentMethodPressHandler = ({event, accountType, accountData, methodID, icon, description, isDefault}: PaymentMethodPressHandlerParams) => void;

type CardPressHandler = ({event, cardID, cardData, icon}: CardPressHandlerParams) => void;

type PaymentMethodListProps = {
    // TODO: can be removed after WorkspaceInvoiceVBASection refactor
    /** Type of active/highlighted payment method */
    actionPaymentMethodType?: string;

    // TODO: can be removed after WorkspaceInvoiceVBASection refactor
    /** ID of active/highlighted payment method */
    activePaymentMethodID?: string | number;

    /** Content for the FlatList header component */
    listHeaderComponent?: ReactElement;

    /** Callback for whenever FlatList component size changes */
    onListContentSizeChange?: () => void;

    /** List container style */
    style?: StyleProp<ViewStyle>;

    /** List item style */
    listItemStyle?: StyleProp<ViewStyle>;

    /** Whether the add bank account button should be shown on the list */
    shouldShowAddBankAccount?: boolean;

    /** Whether the assigned cards should be shown on the list */
    shouldShowAssignedCards?: boolean;

    /** Whether the right icon should be shown in PaymentMethodItem */
    shouldShowRightIcon?: boolean;

    /** Whether the we should skip default account validation when adding bank account */
    shouldSkipDefaultAccountValidation?: boolean;

    /** What to do when a menu item is pressed */
    onPress: PaymentMethodPressHandler | CardPressHandler;

    /** The policy invoice's transfer bank accountID */
    invoiceTransferBankAccountID?: number;

    /** Whether the bank accounts should be displayed in private and business sections */
    shouldShowBankAccountSections?: boolean;

    /** The policy ID associated with the workspace, if component is rendered in workspace context */
    policyID?: string;

    /** Function to be called when the user presses the add bank account button */
    onAddBankAccountPress?: () => void;

    /** The icon to be displayed in the right side of the payment method item */
    itemIconRight?: IconAsset;

    /** Type of payment method to filter by */
    filterType?: ValueOf<typeof CONST.BANK_ACCOUNT.TYPE>;

    /* Currency of payment method to filter by */
    filterCurrency?: string;

    /** Whether to show the default badge for the payment method */
    shouldHideDefaultBadge?: boolean;

    /** Optional array of menu items to be displayed in the three dots menu */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** Callback for when the three dots menu is pressed */
    onThreeDotsMenuPress?: PaymentMethodPressHandler | CardPressHandler;
};

function shouldShowDefaultBadge(filteredPaymentMethods: PaymentMethod[], isDefault = false, shouldHideDefaultBadge = false): boolean {
    if (!isDefault || shouldHideDefaultBadge) {
        return false;
    }
    const defaultPaymentMethodCount = filteredPaymentMethods.filter(
        (method) => method.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || method.accountType === CONST.PAYMENT_METHODS.DEBIT_CARD,
    ).length;
    return defaultPaymentMethodCount > 1;
}

function isPaymentMethodActive(actionPaymentMethodType: string, activePaymentMethodID: string | number, paymentMethod: PaymentMethod) {
    return paymentMethod.accountType === actionPaymentMethodType && paymentMethod.methodID === activePaymentMethodID;
}

function keyExtractor(item: PaymentMethod | string) {
    if (typeof item === 'string') {
        return item;
    }
    return item.key ?? '';
}

function PaymentMethodList({
    actionPaymentMethodType = '',
    activePaymentMethodID = '',
    listHeaderComponent,
    onPress,
    shouldShowAddBankAccount = true,
    shouldShowAssignedCards = false,
    shouldSkipDefaultAccountValidation = false,
    onListContentSizeChange = () => {},
    style = {},
    listItemStyle = {},
    shouldShowRightIcon = true,
    invoiceTransferBankAccountID,
    shouldShowBankAccountSections = false,
    policyID = '',
    onAddBankAccountPress = () => {},
    itemIconRight,
    filterType,
    filterCurrency,
    shouldHideDefaultBadge = false,
    threeDotsMenuItems,
    onThreeDotsMenuPress,
}: PaymentMethodListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ThreeDots']);
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
        canBeMissing: true,
    });
    const [bankAccountList = getEmptyObject<BankAccountList>(), bankAccountListResult] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const isLoadingBankAccountList = isLoadingOnyxValue(bankAccountListResult);
    const [cardList = getEmptyObject<CardList>(), cardListResult] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const isLoadingCardList = isLoadingOnyxValue(cardListResult);
    // Temporarily disabled because P2P debit cards are disabled.
    // const [fundList = getEmptyObject<FundList>()] = useOnyx(ONYXKEYS.FUND_LIST);

    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();

    const filteredPaymentMethods = useMemo(() => {
        if (shouldShowAssignedCards) {
            const assignedCards = Object.values(isLoadingCardList ? {} : (cardList ?? {}))
                // Filter by active cards associated with a domain
                .filter((card) => (!!card.domainName || card.bank === CONST.PERSONAL_CARD.BANK_NAME.CSV) && CONST.EXPENSIFY_CARD.ACTIVE_STATES.includes(card.state ?? 0));

            const assignedCardsSorted = lodashSortBy(assignedCards, getAssignedCardSortKey);

            const assignedCardsGrouped: PaymentMethodItem[] = [];
            for (const card of assignedCardsSorted) {
                const isDisabled = card.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                const icon = getCardFeedIcon(card.bank as CompanyCardFeed, illustrations, companyCardFeedIcons);

                let shouldShowRBR = false;
                if (card.fundID) {
                    const feedNameWithDomainID = getCompanyCardFeedWithDomainID(card.bank as CompanyCardFeed, card.fundID);
                    shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedNameWithDomainID];
                } else {
                    shouldShowRBR = true;
                }

                let brickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
                if (!card.errors) {
                    if (shouldShowRBR) {
                        brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                    } else if (card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN || card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL) {
                        brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                    } else if (isExpensifyCard(card) && isExpensifyCardPendingAction(card, privatePersonalDetails)) {
                        brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
                    }
                }

                if (!isExpensifyCard(card)) {
                    const pressHandler = onPress as CardPressHandler;
                    const lastFourPAN = lastFourNumbersFromCardName(card.cardName);
                    const plaidUrl = getPlaidInstitutionIconUrl(card.bank);
                    const isCSVImportCard = card.bank === CONST.COMPANY_CARDS.BANK_NAME.UPLOAD;
                    assignedCardsGrouped.push({
                        key: card.cardID.toString(),
                        plaidUrl,
                        title: maskCardNumber(card.cardName, card.bank),
                        description: isCSVImportCard
                            ? translate('cardPage.csvCardDescription')
                            : lastFourPAN
                              ? `${lastFourPAN} ${CONST.DOT_SEPARATOR} ${getDescriptionForPolicyDomainCard(card.domainName)}`
                              : getDescriptionForPolicyDomainCard(card.domainName),
                        interactive: !isDisabled,
                        disabled: isDisabled,
                        shouldShowRightIcon,
                        errors: card.errors,
                        canDismissError: false,
                        pendingAction: card.pendingAction,
                        brickRoadIndicator,
                        icon,
                        iconStyles: [styles.cardIcon],
                        iconWidth: variables.cardIconWidth,
                        iconHeight: variables.cardIconHeight,
                        iconRight: itemIconRight ?? expensifyIcons.ThreeDots,
                        isMethodActive: activePaymentMethodID === card.cardID,
                        onPress: (e: GestureResponderEvent | KeyboardEvent | undefined) =>
                            pressHandler({
                                event: e,
                                cardData: card,
                                icon: {
                                    icon,
                                    iconStyles: [styles.cardIcon],
                                    iconWidth: variables.cardIconWidth,
                                    iconHeight: variables.cardIconHeight,
                                },
                                cardID: card.cardID,
                            }),
                    });
                    continue;
                }

                const isAdminIssuedVirtualCard = !!card?.nameValuePairs?.issuedBy && !!card?.nameValuePairs?.isVirtual;
                const isTravelCard = !!card?.nameValuePairs?.isVirtual && !!card?.nameValuePairs?.isTravelCard;

                // The card should be grouped to a specific domain and such domain already exists in a assignedCardsGrouped
                if (assignedCardsGrouped.some((item) => item.isGroupedCardDomain && item.description === card.domainName) && !isAdminIssuedVirtualCard && !isTravelCard) {
                    const domainGroupIndex = assignedCardsGrouped.findIndex((item) => item.isGroupedCardDomain && item.description === card.domainName);
                    const assignedCardsGroupedItem = assignedCardsGrouped.at(domainGroupIndex);
                    if (domainGroupIndex >= 0 && assignedCardsGroupedItem) {
                        assignedCardsGroupedItem.errors = {...assignedCardsGrouped.at(domainGroupIndex)?.errors, ...card.errors};
                        if (
                            card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN ||
                            card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL ||
                            Object.keys(assignedCardsGroupedItem.errors).length > 0
                        ) {
                            assignedCardsGroupedItem.brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                        }
                    }
                    continue;
                }

                const pressHandler = onPress as CardPressHandler;

                // The card shouldn't be grouped or it's domain group doesn't exist yet
                const cardDescription =
                    card?.nameValuePairs?.issuedBy && card?.lastFourPAN
                        ? `${card?.lastFourPAN} ${CONST.DOT_SEPARATOR} ${getDescriptionForPolicyDomainCard(card.domainName)}`
                        : getDescriptionForPolicyDomainCard(card.domainName);
                assignedCardsGrouped.push({
                    key: card.cardID.toString(),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    title: isTravelCard ? translate('cardPage.expensifyTravelCard') : card?.nameValuePairs?.cardTitle || card.bank,
                    description: isTravelCard ? translate('cardPage.expensifyTravelCard') : cardDescription,
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(card.cardID))),
                    onThreeDotsMenuPress: (e: GestureResponderEvent | KeyboardEvent | undefined) =>
                        pressHandler({
                            event: e,
                            cardData: card,
                            icon: {
                                icon,
                                iconStyles: [styles.cardIcon],
                                iconWidth: variables.cardIconWidth,
                                iconHeight: variables.cardIconHeight,
                            },
                            cardID: card.cardID,
                        }),
                    cardID: card.cardID,
                    isGroupedCardDomain: !isAdminIssuedVirtualCard && !isTravelCard,
                    shouldShowRightIcon: true,
                    interactive: !isDisabled,
                    disabled: isDisabled,
                    errors: card.errors,
                    canDismissError: true,
                    pendingAction: card.pendingAction,
                    brickRoadIndicator,
                    icon,
                    iconStyles: [styles.cardIcon],
                    iconWidth: variables.cardIconWidth,
                    iconHeight: variables.cardIconHeight,
                });
            }
            return assignedCardsGrouped;
        }

        // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
        // All payment cards are temporarily disabled for use as a payment method
        // const paymentCardList = fundList ?? {};
        // const filteredCardList = Object.values(paymentCardList).filter((card) => !!card.accountData?.additionalData?.isP2PDebitCard);
        const filteredCardList = {};
        let combinedPaymentMethods = formatPaymentMethods(isLoadingBankAccountList ? {} : (bankAccountList ?? {}), filteredCardList, styles, translate);

        if (!isOffline) {
            combinedPaymentMethods = combinedPaymentMethods.filter(
                (paymentMethod) => paymentMethod.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(paymentMethod.errors),
            );
        }

        if (filterType ?? filterCurrency) {
            combinedPaymentMethods = combinedPaymentMethods.filter((paymentMethod) => {
                const account = paymentMethod as BankAccount;
                const typeMatches = !filterType || account.accountData?.type === filterType;
                const currencyMatches = !filterCurrency || account.bankCurrency === filterCurrency;

                return typeMatches && currencyMatches;
            });
        }

        combinedPaymentMethods = combinedPaymentMethods.map((paymentMethod) => {
            const pressHandler = onPress as PaymentMethodPressHandler;
            const isMethodActive = isPaymentMethodActive(actionPaymentMethodType, activePaymentMethodID, paymentMethod);
            const paymentMethodData = {
                accountType: paymentMethod.accountType,
                accountData: paymentMethod.accountData,
                icon: {
                    icon: paymentMethod.icon,
                    iconHeight: paymentMethod?.iconHeight,
                    iconWidth: paymentMethod?.iconWidth,
                    iconStyles: paymentMethod?.iconStyles,
                    iconSize: paymentMethod?.iconSize,
                },
                isDefault: paymentMethod.isDefault,
                methodID: paymentMethod.methodID,
                description: paymentMethod.description,
            };
            return {
                ...paymentMethod,
                title: paymentMethod.title?.includes(CONST.MASKED_PAN_PREFIX) ? paymentMethod.accountData?.additionalData?.bankName : paymentMethod.title,
                onPress: (e: GestureResponderEvent) =>
                    pressHandler({
                        event: e,
                        ...paymentMethodData,
                    }),
                onThreeDotsMenuPress: onThreeDotsMenuPress
                    ? (e: GestureResponderEvent) =>
                          onThreeDotsMenuPress({
                              event: e,
                              ...paymentMethodData,
                          })
                    : undefined,
                disabled: paymentMethod.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isMethodActive,
                iconRight: itemIconRight ?? expensifyIcons.ThreeDots,
                shouldShowRightIcon,
                canDismissError: true,
            };
        });
        return combinedPaymentMethods;
    }, [
        shouldShowAssignedCards,
        isLoadingBankAccountList,
        bankAccountList,
        styles,
        translate,
        isOffline,
        filterType,
        filterCurrency,
        isLoadingCardList,
        cardList,
        illustrations,
        companyCardFeedIcons,
        shouldShowRbrForFeedNameWithDomainID,
        privatePersonalDetails,
        onPress,
        shouldShowRightIcon,
        itemIconRight,
        expensifyIcons.ThreeDots,
        activePaymentMethodID,
        actionPaymentMethodType,
        onThreeDotsMenuPress,
    ]);

    const onPressItem = useCallback(() => {
        if (!isUserValidated && !shouldSkipDefaultAccountValidation) {
            const path = Navigation.getActiveRoute();
            if (path.includes(ROUTES.WORKSPACES_LIST.route) && policyID) {
                Navigation.navigate(ROUTES.WORKSPACE_INVOICES_VERIFY_ACCOUNT.getRoute(policyID));
            } else {
                Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.route);
            }
            return;
        }
        onAddBankAccountPress();
    }, [isUserValidated, onAddBankAccountPress, policyID, shouldSkipDefaultAccountValidation]);

    const renderListFooterComponent = useCallback(
        () => (
            <MenuItem
                onPress={onPressItem}
                title={translate('bankAccount.addBankAccount')}
                icon={Expensicons.Plus}
                wrapperStyle={[styles.paymentMethod, listItemStyle]}
            />
        ),

        [onPressItem, translate, styles.paymentMethod, listItemStyle],
    );

    const itemsToRender = useMemo(() => {
        if (!shouldShowBankAccountSections) {
            return filteredPaymentMethods;
        }
        if (
            filteredPaymentMethods.find((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL) &&
            filteredPaymentMethods.find((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS)
        ) {
            return [
                translate('walletPage.personalBankAccounts'),
                ...filteredPaymentMethods.filter((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL),
                translate('walletPage.businessBankAccounts'),
                ...filteredPaymentMethods.filter((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS),
            ];
        }
        return filteredPaymentMethods;
    }, [filteredPaymentMethods, shouldShowBankAccountSections, translate]);

    /**
     * Create a menuItem for each passed paymentMethod
     */
    const renderItem = useCallback(
        ({item, index}: RenderSuggestionMenuItemProps<PaymentMethodItem | string>) => {
            if (typeof item === 'string') {
                return (
                    <View style={[listItemStyle, index === 0 ? styles.mt4 : styles.mt6, styles.mb1]}>
                        <Text style={[styles.textLabel, styles.colorMuted]}>{item}</Text>
                    </View>
                );
            }
            return (
                <PaymentMethodListItem
                    item={item}
                    shouldShowDefaultBadge={shouldShowDefaultBadge(
                        filteredPaymentMethods,
                        invoiceTransferBankAccountID ? invoiceTransferBankAccountID === item.methodID : item.methodID === userWallet?.walletLinkedAccountID,
                        shouldHideDefaultBadge,
                    )}
                    listItemStyle={listItemStyle}
                    threeDotsMenuItems={threeDotsMenuItems}
                />
            );
        },
        [
            filteredPaymentMethods,
            invoiceTransferBankAccountID,
            userWallet?.walletLinkedAccountID,
            shouldHideDefaultBadge,
            listItemStyle,
            threeDotsMenuItems,
            styles.mt4,
            styles.mt6,
            styles.mb1,
            styles.textLabel,
            styles.colorMuted,
        ],
    );

    return (
        <View style={[style, {minHeight: (filteredPaymentMethods.length + (shouldShowAddBankAccount ? 1 : 0)) * variables.optionRowHeight}]}>
            <FlashList<PaymentMethod | string>
                data={itemsToRender}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={listHeaderComponent}
                ListFooterComponent={shouldShowAddBankAccount ? renderListFooterComponent : null}
                onContentSizeChange={onListContentSizeChange}
            />
        </View>
    );
}

export default PaymentMethodList;
