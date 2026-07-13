import type {RenderSuggestionMenuItemProps} from '@components/AutoCompleteSuggestions/types';
import MenuItem from '@components/MenuItem';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Text from '@components/Text';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {getBankAccountConnectionStatus, getBankAccountState, isPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import type {BankAccountConnectionStatus} from '@libs/BankAccountUtils';
import {
    getAssignedCardSortKey,
    getCardFeedIcon,
    getCardFeedWithDomainID,
    getPlaidInstitutionIconUrl,
    isActionableVirtualExpensifyCard,
    isCardConnectionBroken,
    isCardFrozen,
    isCardInactive,
    isExpensifyCard,
    isExpensifyCardPendingAction,
    isExpiredCard,
    isPersonalCard,
    isTravelCard,
    lastFourNumbersFromCardName,
    maskCardNumber,
} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {areAddressAndPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {getDescriptionForPolicyDomainCard, getPolicyIDFromDomainName, isPolicyAdmin} from '@libs/PolicyUtils';
import {getTravelInvoicingCard, isTravelCVVEligible} from '@libs/TravelInvoicingUtils';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {BankAccount, BankAccountList, CardList, Policy} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactElement} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {isActingAsDelegateSelector, isUserValidatedSelector} from '@selectors/Account';
import {createPoliciesForDomainCardsSelector} from '@selectors/Policy';
import {FlashList} from '@shopify/flash-list';
import lodashSortBy from 'lodash/sortBy';
import React from 'react';
import {View} from 'react-native';

import type {PaymentMethodItem} from './PaymentMethodListItem';
import type {CardPressHandlerParams, PaymentMethodPressHandlerParams} from './WalletPage/types';

import PaymentMethodListItem from './PaymentMethodListItem';

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

    /** Additional style for the add bank account item */
    addBankAccountItemStyle?: StyleProp<ViewStyle>;

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

    /** Account states to exclude from the list */
    excludeStates?: Array<ValueOf<typeof CONST.BANK_ACCOUNT.STATE>>;

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
    addBankAccountItemStyle,
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
    excludeStates,
    shouldHideDefaultBadge = false,
    threeDotsMenuItems,
    onThreeDotsMenuPress,
}: PaymentMethodListProps) {
    const styles = useThemeStyles();
    const {translate, datetimeToRelative} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus', 'ThreeDots', 'LuggageWithLines']);
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isActingAsDelegateSelector,
    });
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [bankAccountList = getEmptyObject<BankAccountList>(), bankAccountListResult] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const isLoadingBankAccountList = isLoadingOnyxValue(bankAccountListResult);
    const [cardList = getEmptyObject<CardList>(), cardListResult] = useOnyx(ONYXKEYS.CARD_LIST);
    const isLoadingCardList = isLoadingOnyxValue(cardListResult);
    const cardDomains = shouldShowAssignedCards
        ? Object.values(isLoadingCardList ? {} : (cardList ?? {}))
              .filter((card) => !!card.domainName)
              .map((card) => card.domainName)
        : [];
    const policiesForDomainCardsSelectorFactory = createPoliciesForDomainCardsSelector(cardDomains);
    const [policiesForAssignedCards] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => policiesForDomainCardsSelectorFactory(policies),
    });
    // Temporarily disabled because P2P debit cards are disabled.
    // const [fundList = getEmptyObject<FundList>()] = useOnyx(ONYXKEYS.FUND_LIST);

    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();
    const shouldShowListFooterComponent = shouldShowAddBankAccount;
    const shouldShowConnectionStatus = isBetaEnabled(CONST.BETAS.SUBMIT_2026);

    const appendCardLastSync = (description: string | undefined, lastSyncText: string) => [description, lastSyncText].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `);

    const mapBankStatusToRowStatus = (
        status: BankAccountConnectionStatus,
        onActionPress: (e: GestureResponderEvent | KeyboardEvent | undefined) => void,
        onUnlockPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void,
    ): PaymentMethodItem['connectionStatus'] => ({
        statusText: translate(status.labelKey),
        statusTone: status.tone,
        tooltipText: status.tooltipKey ? translate(status.tooltipKey) : undefined,
        message: status.messageKey ? translate(status.messageKey) : undefined,
        actionText: status.actionKey ? translate(status.actionKey) : undefined,
        onActionPress: () => {
            if (status.requiresUnlockHandler) {
                (onUnlockPress ?? onActionPress)(undefined);
                return;
            }
            onActionPress(undefined);
        },
    });

    const computeFilteredPaymentMethods = (): Array<PaymentMethodItem | string> => {
        if (shouldShowAssignedCards) {
            const assignedCards = Object.values(isLoadingCardList ? {} : (cardList ?? {}))
                // Include active Expensify cards, company cards (domain), and personal cards
                .filter(
                    (card) =>
                        CONST.EXPENSIFY_CARD.ACTIVE_STATES.includes(card.state ?? 0) &&
                        (isExpensifyCard(card) || !!card.domainName || isPersonalCard(card)) &&
                        card.cardName !== CONST.COMPANY_CARDS.CARD_NAME.CASH &&
                        (!isExpensifyCard(card) || !isExpiredCard(card)),
                );

            const assignedCardsSorted = lodashSortBy(assignedCards, getAssignedCardSortKey);
            const companyCardsGrouped: PaymentMethodItem[] = [];
            const personalCardsGrouped: PaymentMethodItem[] = [];
            const hasMissingPersonalDetails = areAddressAndPersonalDetailsMissing(privatePersonalDetails);
            for (const card of assignedCardsSorted) {
                const isDisabled = card.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                const isUserPersonalCard = isPersonalCard(card);
                const isCSVCard = card.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD || card.bank.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV);
                const assignedCardsGrouped = isUserPersonalCard ? personalCardsGrouped : companyCardsGrouped;
                const policyIDForCard = shouldShowConnectionStatus ? getPolicyIDFromDomainName(card.domainName) : undefined;
                const policyForCard = policyIDForCard ? policiesForAssignedCards?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDForCard}`] : undefined;
                const isAdminForCardPolicy = shouldShowConnectionStatus ? isPolicyAdmin(policyForCard) : false;

                let icon;
                if (isUserPersonalCard && isCSVCard) {
                    icon = getCardFeedIcon(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, illustrations, companyCardFeedIcons);
                } else {
                    icon = getCardFeedIcon(card.bank, illustrations, companyCardFeedIcons);
                }

                let shouldShowRBR = false;
                if (card.fundID) {
                    const feedNameWithDomainID = getCardFeedWithDomainID(card.bank, card.fundID);
                    shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedNameWithDomainID];
                } else if (card.bank !== CONST.PERSONAL_CARDS.BANK_NAME.CSV) {
                    // Don't show red dot for CSV imported cards without fundID
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

                if (isUserPersonalCard && (!isEmptyObject(card.errors) || isCardConnectionBroken(card))) {
                    brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                }

                const isCardBroken = isCardConnectionBroken(card);
                const isCardInactiveState = isCardInactive(card);
                const shouldShowCardConnectionMessage = shouldShowConnectionStatus && (isCardBroken || shouldShowRBR || isCardInactiveState);
                const shouldShowCardLastSync = shouldShowConnectionStatus && !isExpensifyCard(card) && !isCSVCard;
                let cardLastSyncText: string | undefined;
                if (shouldShowCardLastSync) {
                    if (card.lastScrape) {
                        cardLastSyncText = translate('walletPage.cardLastSynced', datetimeToRelative(card.lastScrape.replace(' ', 'T')));
                    } else {
                        cardLastSyncText = translate('walletPage.cardNeverSynced');
                    }
                }
                let cardConnectionStatus: PaymentMethodItem['connectionStatus'];
                if (shouldShowConnectionStatus) {
                    let cardStatusTone: NonNullable<PaymentMethodItem['connectionStatus']>['statusTone'] = 'success';
                    if (shouldShowCardConnectionMessage) {
                        cardStatusTone = 'danger';
                    }

                    let cardConnectionMessage: string | undefined;
                    if (shouldShowCardConnectionMessage) {
                        let messageKey: 'walletPage.cardStatus.fixConnectionIn' | 'walletPage.cardStatus.fixConnection' | 'walletPage.cardStatus.askAdminToFixConnection';
                        if (!isUserPersonalCard && isAdminForCardPolicy) {
                            messageKey = 'walletPage.cardStatus.fixConnectionIn';
                        } else if (isUserPersonalCard) {
                            messageKey = 'walletPage.cardStatus.fixConnection';
                        } else {
                            messageKey = 'walletPage.cardStatus.askAdminToFixConnection';
                        }
                        cardConnectionMessage = translate(messageKey);
                    }

                    cardConnectionStatus = {
                        statusText: translate(shouldShowCardConnectionMessage ? 'walletPage.cardStatus.inactive' : 'walletPage.cardStatus.active'),
                        statusTone: cardStatusTone,
                        message: cardConnectionMessage,
                        actionText: isUserPersonalCard && shouldShowCardConnectionMessage ? translate('common.actionBadge.fix') : undefined,
                        onActionPress:
                            isUserPersonalCard && shouldShowCardConnectionMessage
                                ? () => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_FIX_CONNECTION.getRoute(String(card.cardID)))
                                : undefined,
                        linkText: !isUserPersonalCard && isAdminForCardPolicy && shouldShowCardConnectionMessage ? translate('walletPage.cardStatus.companyCardsLink') : undefined,
                        onLinkPress:
                            !isUserPersonalCard && isAdminForCardPolicy && policyIDForCard && shouldShowCardConnectionMessage
                                ? () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyIDForCard))
                                : undefined,
                    };
                }

                if (!isExpensifyCard(card)) {
                    const lastFourPAN = lastFourNumbersFromCardName(card.cardName);
                    const plaidUrl = getPlaidInstitutionIconUrl(card.bank);
                    const isCSVImportCard = card.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD;
                    let cardTitle = isCSVImportCard ? (card.nameValuePairs?.cardTitle ?? card.cardName) : maskCardNumber(card.cardName, card.bank);
                    const pressHandler = onPress as CardPressHandler;
                    let cardDescription;
                    if (isUserPersonalCard) {
                        cardTitle = customCardNames?.[card.cardID] ?? cardTitle;
                        cardDescription = lastFourPAN;
                    } else if (lastFourPAN) {
                        cardDescription = `${lastFourPAN} ${CONST.DOT_SEPARATOR} ${getDescriptionForPolicyDomainCard(card.domainName, policiesForAssignedCards)}`;
                    } else {
                        cardDescription = getDescriptionForPolicyDomainCard(card.domainName, policiesForAssignedCards);
                    }
                    // Personal cards (including CSV imported) navigate to the personal card details page
                    // Company cards use the pressHandler callback (for 3-dot menu behavior)
                    const cardOnPress = isUserPersonalCard
                        ? () => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(String(card.cardID)))
                        : (e: GestureResponderEvent | KeyboardEvent | undefined) =>
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
                              });

                    let itemDescription = cardDescription;
                    if (isCSVImportCard) {
                        itemDescription = translate('cardPage.csvCardDescription');
                    }
                    if (shouldShowConnectionStatus && cardLastSyncText) {
                        itemDescription = appendCardLastSync(itemDescription, cardLastSyncText);
                    }

                    assignedCardsGrouped.push({
                        key: card.cardID.toString(),
                        plaidUrl,
                        title: cardTitle,
                        description: itemDescription,
                        connectionStatus: cardConnectionStatus,
                        interactive: !isDisabled,
                        disabled: isDisabled,
                        shouldShowRightIcon,
                        shouldShowThreeDotsMenu: !isUserPersonalCard,
                        errors: (shouldShowConnectionStatus && shouldShowCardConnectionMessage) || isUserPersonalCard ? undefined : card.errors,
                        canDismissError: false,
                        pendingAction: card.pendingAction,
                        brickRoadIndicator,
                        icon,
                        iconStyles: [styles.cardIcon],
                        iconWidth: variables.cardIconWidth,
                        iconHeight: variables.cardIconHeight,
                        isMethodActive: activePaymentMethodID === card.cardID,
                        isInactive: isCardInactive(card),
                        onPress: cardOnPress,
                    });
                    continue;
                }

                const isAdminIssuedVirtualCard = !!card?.nameValuePairs?.issuedBy && !!card?.nameValuePairs?.isVirtual;

                // Travel cards are handled by the dedicated travelCardGrouped section below
                if (isTravelCard(card)) {
                    continue;
                }

                if (!shouldShowConnectionStatus && assignedCardsGrouped.some((item) => item.isGroupedCardDomain && item.description === card.domainName) && !isAdminIssuedVirtualCard) {
                    const domainGroupIndex = assignedCardsGrouped.findIndex((item) => item.isGroupedCardDomain && item.description === card.domainName);
                    const assignedCardsGroupedItem = assignedCardsGrouped.at(domainGroupIndex);
                    if (domainGroupIndex >= 0 && assignedCardsGroupedItem) {
                        assignedCardsGroupedItem.errors = {
                            ...assignedCardsGrouped.at(domainGroupIndex)?.errors,
                            ...card.errors,
                        };
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
                const cardDescription =
                    card?.nameValuePairs?.issuedBy && card?.lastFourPAN
                        ? `${card?.lastFourPAN} ${CONST.DOT_SEPARATOR} ${getDescriptionForPolicyDomainCard(card.domainName, policiesForAssignedCards)}`
                        : getDescriptionForPolicyDomainCard(card.domainName, policiesForAssignedCards);
                let cardTitle = card?.nameValuePairs?.cardTitle ?? card.bank;
                if (!shouldShowConnectionStatus) {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    cardTitle = card?.nameValuePairs?.cardTitle || card.bank;
                }

                let itemDescription = cardDescription;
                if (shouldShowConnectionStatus && cardLastSyncText) {
                    itemDescription = appendCardLastSync(cardDescription, cardLastSyncText);
                }

                assignedCardsGrouped.push({
                    key: card.cardID.toString(),
                    title: cardTitle,
                    description: itemDescription,
                    connectionStatus: cardConnectionStatus,
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
                    isGroupedCardDomain: !isAdminIssuedVirtualCard,
                    shouldShowRightIcon: true,
                    interactive: !isDisabled,
                    disabled: isDisabled,
                    errors: shouldShowConnectionStatus && shouldShowCardConnectionMessage ? undefined : card.errors,
                    canDismissError: true,
                    pendingAction: card.pendingAction,
                    brickRoadIndicator,
                    icon,
                    iconStyles: [styles.cardIcon],
                    iconWidth: variables.cardIconWidth,
                    iconHeight: variables.cardIconHeight,
                    isInactive: isCardInactive(card),
                    isCardFrozen: isCardFrozen(card),
                    shouldShowMissingPersonalDetailsAction: !isActingAsDelegate && isActionableVirtualExpensifyCard(card) && hasMissingPersonalDetails,
                });
            }

            const travelCardGrouped: PaymentMethodItem[] = [];
            const travelCard = getTravelInvoicingCard(cardList);
            if (isTravelCVVEligible(cardList) && travelCard) {
                travelCardGrouped.push({
                    title: translate('walletPage.travelCVV.title'),
                    description: translate('walletPage.travelCVV.subtitle'),
                    icon: expensifyIcons.LuggageWithLines,
                    iconFill: colors.productLight100,
                    iconStyles: styles.travelInvoicingIcon,
                    shouldShowRightIcon: true,
                    shouldShowThreeDotsMenu: false,
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_WALLET_TRAVEL_CVV),
                });
            }

            const companyCards = [translate('workspace.common.companyCards'), ...companyCardsGrouped, ...travelCardGrouped];
            const personalCards = [translate('workspace.common.personalCards'), ...personalCardsGrouped];
            if (companyCardsGrouped.length > 0 && personalCardsGrouped.length > 0) {
                return [...companyCards, ...personalCards];
            }
            return [...companyCardsGrouped, ...travelCardGrouped, ...personalCardsGrouped];
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

        if (excludeStates?.length) {
            combinedPaymentMethods = combinedPaymentMethods.filter((paymentMethod) => {
                const account = paymentMethod as BankAccount;
                const bankAccountState = getBankAccountState(account.accountData) as ValueOf<typeof CONST.BANK_ACCOUNT.STATE> | undefined;
                return !bankAccountState || !excludeStates.includes(bankAccountState);
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
            const existingBrickRoadIndicator = (paymentMethod as Partial<PaymentMethodItem>).brickRoadIndicator;
            const isMissingPersonalInfo = isPersonalBankAccountMissingInfo(paymentMethod.accountData);
            const bankConnectionStatus = shouldShowConnectionStatus && !isMissingPersonalInfo ? getBankAccountConnectionStatus(getBankAccountState(paymentMethod.accountData)) : undefined;
            const paymentMethodPress = (e: GestureResponderEvent | KeyboardEvent | undefined) =>
                pressHandler({
                    event: e,
                    ...paymentMethodData,
                });
            const paymentMethodThreeDotsPress =
                onThreeDotsMenuPress &&
                ((e: GestureResponderEvent | KeyboardEvent | undefined) =>
                    onThreeDotsMenuPress({
                        event: e,
                        ...paymentMethodData,
                    }));

            return {
                ...paymentMethod,
                title: paymentMethod.title?.includes(CONST.MASKED_PAN_PREFIX) ? paymentMethod.accountData?.additionalData?.bankName : paymentMethod.title,
                onPress: paymentMethodPress,
                onThreeDotsMenuPress: paymentMethodThreeDotsPress,
                disabled: paymentMethod.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isMethodActive,
                iconRight: itemIconRight ?? expensifyIcons.ThreeDots,
                shouldShowRightIcon,
                canDismissError: true,
                isMissingPersonalInfo,
                brickRoadIndicator: shouldShowConnectionStatus ? (bankConnectionStatus?.brickRoadIndicator ?? existingBrickRoadIndicator) : existingBrickRoadIndicator,
                connectionStatus: bankConnectionStatus ? mapBankStatusToRowStatus(bankConnectionStatus, paymentMethodPress, paymentMethodThreeDotsPress) : undefined,
            };
        });
        return combinedPaymentMethods;
    };

    const filteredPaymentMethods = computeFilteredPaymentMethods();

    const onPressItem = () => {
        if (!isUserValidated && !shouldSkipDefaultAccountValidation) {
            const path = Navigation.getActiveRoute();
            if (path.includes(ROUTES.WORKSPACES_LIST.route) && policyID) {
                Navigation.navigate(ROUTES.WORKSPACE_INVOICES_VERIFY_ACCOUNT.getRoute(policyID));
            } else {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.path));
            }
            return;
        }
        onAddBankAccountPress();
    };

    const renderListFooterComponent = () => (
        <MenuItem
            onPress={onPressItem}
            title={translate('bankAccount.addBankAccount')}
            icon={expensifyIcons.Plus}
            wrapperStyle={[styles.paymentMethod, listItemStyle, addBankAccountItemStyle]}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.ADD_BANK_ACCOUNT}
        />
    );

    const hasPersonalBank = filteredPaymentMethods.find((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);
    const hasBusinessBank = filteredPaymentMethods.find((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);
    const itemsToRender =
        shouldShowBankAccountSections && hasPersonalBank && hasBusinessBank
            ? [
                  translate('walletPage.personalBankAccounts'),
                  ...filteredPaymentMethods.filter((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL),
                  translate('walletPage.businessBankAccounts'),
                  ...filteredPaymentMethods.filter((method) => (method as BankAccount).accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS),
              ]
            : filteredPaymentMethods;

    const filteredPaymentMethodsWithoutStrings = filteredPaymentMethods.filter((method) => typeof method !== 'string');

    const renderItem = ({item, index}: RenderSuggestionMenuItemProps<PaymentMethodItem | string>) => {
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
                    filteredPaymentMethodsWithoutStrings,
                    invoiceTransferBankAccountID ? invoiceTransferBankAccountID === item.methodID : item.methodID === userWallet?.walletLinkedAccountID,
                    shouldHideDefaultBadge,
                )}
                listItemStyle={listItemStyle}
                threeDotsMenuItems={threeDotsMenuItems}
            />
        );
    };

    return (
        <View
            style={[
                style,
                {
                    minHeight: (filteredPaymentMethods.length + (shouldShowListFooterComponent ? 1 : 0)) * variables.optionRowHeight,
                },
            ]}
        >
            <FlashList<PaymentMethod | string>
                data={itemsToRender}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={listHeaderComponent}
                ListFooterComponent={shouldShowListFooterComponent ? renderListFooterComponent : null}
                onContentSizeChange={onListContentSizeChange}
            />
        </View>
    );
}

export default PaymentMethodList;
