import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchFilterKey, UserFriendlyKey} from '@components/Search/types';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {getCardDescription, isCard, isCardHiddenFromSearch} from '@libs/CardUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import type {OptionList} from '@libs/OptionsListUtils';
import {getSearchOptions} from '@libs/OptionsListUtils';
import {getAllTaxRates, getCleanedTagName, shouldShowPolicy} from '@libs/PolicyUtils';
import {
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    parseForAutocomplete,
} from '@libs/SearchAutocompleteUtils';
import {getUserFriendlyKey, getUserFriendlyValue} from '@libs/SearchQueryUtils';
import {getDatePresets, getHasOptions} from '@libs/SearchUIUtils';
import CONST, {CONTINUATION_DETECTION_SEARCH_FILTER_KEYS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, CardFeeds, CardList, DismissedProductTraining, PersonalDetailsList, Policy} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {useCurrencyListState} from './useCurrencyList';
import useExportedToFilterOptions from './useExportedToFilterOptions';
import type {FeedKeysWithAssignedCards} from './useFeedKeysWithAssignedCards';
import useOnyx from './useOnyx';

type AutocompleteItemData = {
    filterKey: UserFriendlyKey;
    text: string;
    autocompleteID?: string;
    mapKey?: SearchFilterKey;
};

type UseAutocompleteSuggestionsParams = {
    autocompleteQueryValue: string;
    allCards: CardList | undefined;
    allFeeds: Record<string, CardFeeds | undefined> | undefined;
    options: OptionList;
    draftComments: OnyxCollection<string>;
    nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>;
    betas: OnyxEntry<Beta[]>;
    countryCode: OnyxEntry<number>;
    loginList: OnyxEntry<Record<string, unknown>>;
    policies: NonNullable<OnyxCollection<Policy>>;
    visibleReportActionsData?: VisibleReportActionsDerivedValue;
    currentUserAccountID: number;
    currentUserEmail: string;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    feedKeysWithCards?: FeedKeysWithAssignedCards;
    translate: LocaleContextProps['translate'];
};

// Static autocomplete lists derived from CONST values, computed once at module load
const DATA_TYPE_VALUES = Object.values(CONST.SEARCH.DATA_TYPES);
const GROUP_BY_FRIENDLY_VALUES = Object.values(CONST.SEARCH.GROUP_BY).map((value) => getUserFriendlyValue(value));
const VIEW_FRIENDLY_VALUES = Object.values(CONST.SEARCH.VIEW).map((value) => getUserFriendlyValue(value));
const EXPENSE_TYPE_FRIENDLY_VALUES = Object.values(CONST.SEARCH.TRANSACTION_TYPE).map((value) => getUserFriendlyValue(value));
const WITHDRAWAL_TYPE_VALUES = Object.values(CONST.SEARCH.WITHDRAWAL_TYPE);
const BOOLEAN_VALUES = Object.values(CONST.SEARCH.BOOLEAN);
const ACTION_FILTER_VALUES = Object.values(CONST.SEARCH.ACTION_FILTERS);
const IS_VALUES_LIST = Object.values(CONST.SEARCH.IS_VALUES);
const EXPENSE_STATUS_VALUES = Object.values(CONST.SEARCH.STATUS.EXPENSE);
const EXPENSE_REPORT_STATUS_VALUES = Object.values(CONST.SEARCH.STATUS.EXPENSE_REPORT);
const INVOICE_STATUS_VALUES = Object.values(CONST.SEARCH.STATUS.INVOICE);
const TRIP_STATUS_VALUES = Object.values(CONST.SEARCH.STATUS.TRIP);
const TASK_STATUS_VALUES = Object.values(CONST.SEARCH.STATUS.TASK);
const DEFAULT_STATUS_VALUES = Object.values({
    ...CONST.SEARCH.STATUS.EXPENSE,
    ...CONST.SEARCH.STATUS.INVOICE,
    ...CONST.SEARCH.STATUS.TRIP,
    ...CONST.SEARCH.STATUS.TASK,
});

/**
 * Computes autocomplete suggestions for the search router.
 *
 * Guards all expensive derived computations behind the autocomplete key so that
 * on initial open (empty query) none of the heavy data processing runs.
 */
function useAutocompleteSuggestions({
    autocompleteQueryValue,
    allCards = CONST.EMPTY_OBJECT,
    allFeeds,
    options,
    draftComments,
    nvpDismissedProductTraining,
    betas,
    countryCode,
    loginList,
    policies,
    visibleReportActionsData,
    currentUserAccountID,
    currentUserEmail,
    personalDetails,
    feedKeysWithCards,
    translate,
}: UseAutocompleteSuggestionsParams): AutocompleteItemData[] {
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allRecentCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES);
    const [recentCurrencyAutocompleteList] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allRecentTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS);
    const {currencyList} = useCurrencyListState();
    const {exportedToFilterOptions} = useExportedToFilterOptions();

    const parsedQuery = parseForAutocomplete(autocompleteQueryValue);
    const {autocomplete, ranges = []} = parsedQuery ?? {};

    let autocompleteKey = autocomplete?.key;
    let autocompleteValue = autocomplete?.value ?? '';

    if (!autocomplete && ranges.length > 0) {
        const lastRange = ranges.at(ranges.length - 1);
        if (lastRange && CONTINUATION_DETECTION_SEARCH_FILTER_KEYS.includes(lastRange.key)) {
            const afterLastRange = autocompleteQueryValue.substring(lastRange.start + lastRange.length);
            const continuationMatch = afterLastRange.match(/^\s+(\w+)/);

            if (continuationMatch) {
                autocompleteKey = lastRange.key;
                autocompleteValue = `${lastRange.value} ${continuationMatch[1]}`;
            }
        }
    }

    if (!autocompleteKey) {
        return [];
    }

    const alreadyAutocompletedKeys = new Set(
        ranges
            .filter((range) => {
                return autocompleteKey && range.key === autocompleteKey;
            })
            .map((range) => range.value.toLowerCase()),
    );

    const typeFilter = parsedQuery?.ranges?.find((range) => range.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE);
    const currentType = (typeFilter?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE) as SearchDataTypes;

    switch (autocompleteKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
            const tagAutocompleteList = getAutocompleteTags(allPoliciesTags);
            const recentTagsAutocompleteList = getAutocompleteRecentTags(allRecentTags);
            const autocompleteList = autocompleteValue ? tagAutocompleteList : (recentTagsAutocompleteList ?? []);
            const filteredTags = autocompleteList
                .filter((tag) => getCleanedTagName(tag).toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(getCleanedTagName(tag).toLowerCase()))
                .sort()
                .slice(0, 10);

            return filteredTags.map((tagName) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAG,
                text: getCleanedTagName(tagName),
                autocompleteID: tagName,
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
            const categoryAutocompleteList = getAutocompleteCategories(allPolicyCategories);
            const recentCategoriesAutocompleteList = getAutocompleteRecentCategories(allRecentCategories);
            const autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
            const filteredCategories = autocompleteList
                .filter((category) => category?.toLowerCase()?.includes(autocompleteValue?.toLowerCase()) && !alreadyAutocompletedKeys.has(category?.toLowerCase()))
                .sort()
                .slice(0, 10);

            return filteredCategories.map((categoryName) => {
                const decodedCategoryName = getDecodedCategoryName(categoryName);
                return {
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CATEGORY,
                    text: decodedCategoryName,
                };
            });
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY: {
            const currencyAutocompleteList = Object.keys(currencyList).filter((currency) => !currencyList[currency]?.retired);
            const autocompleteList = autocompleteValue ? currencyAutocompleteList : (recentCurrencyAutocompleteList ?? []);
            const filteredCurrencies = autocompleteList
                .filter((currency) => currency.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(currency.toLowerCase()))
                .sort()
                .slice(0, 10);

            const friendlyKey = getUserFriendlyKey(autocompleteKey);
            return filteredCurrencies.map((currencyName) => ({
                filterKey: friendlyKey,
                text: currencyName,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
            const taxRates = getAllTaxRates(policies);
            const taxAutocompleteList = getAutocompleteTaxList(taxRates);
            const filteredTaxRates = taxAutocompleteList
                .filter((tax) => tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(tax.taxRateName.toLowerCase()))
                .sort()
                .slice(0, 10);

            return filteredTaxRates.map((tax) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE,
                text: tax.taxRateName,
                autocompleteID: tax.taxRateIds.join(','),
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER: {
            const participants = getSearchOptions({
                options,
                draftComments,
                nvpDismissedProductTraining,
                betas: betas ?? [],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: autocompleteValue,
                maxResults: 10,
                includeUserToInvite: false,
                includeRecentReports: false,
                includeCurrentUser: true,
                countryCode,
                loginList,
                shouldShowGBR: true,
                visibleReportActionsData,
                policyCollection: policies,
                currentUserAccountID,
                currentUserEmail,
                personalDetails,
            }).personalDetails.filter((participant) => participant.text && !alreadyAutocompletedKeys.has(participant.text.toLowerCase()));

            return participants.map((participant) => ({
                filterKey: autocompleteKey,
                text: participant.login === currentUserEmail ? CONST.SEARCH.ME : (participant.text ?? ''),
                autocompleteID: String(participant.accountID),
                mapKey: autocompleteKey,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
            // If autocompleteValue is empty or just whitespace and we have already completed keys,
            // return empty array to hide suggestion list (consistent with group-by behavior)
            if (!autocompleteValue.trim() && alreadyAutocompletedKeys.size > 0) {
                return [];
            }

            const filteredReports = getSearchOptions({
                options,
                draftComments,
                nvpDismissedProductTraining,
                betas: betas ?? [],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: autocompleteValue,
                maxResults: 10,
                includeUserToInvite: false,
                includeRecentReports: true,
                includeCurrentUser: false,
                countryCode,
                loginList,
                shouldShowGBR: true,
                visibleReportActionsData,
                policyCollection: policies,
                currentUserAccountID,
                currentUserEmail,
                personalDetails,
            }).recentReports.filter((chat) => {
                if (!chat.text) {
                    return false;
                }
                return !alreadyAutocompletedKeys.has(chat.text.toLowerCase());
            });

            return filteredReports.map((chat) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN,
                text: chat.text ?? '',
                autocompleteID: chat.reportID,
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
            }));
        }
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
            const filteredTypes = DATA_TYPE_VALUES.filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(type.toLowerCase())).sort();

            return filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE, text: type}));
        }
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY: {
            const groupByAutocompleteList = (() => {
                switch (currentType) {
                    case CONST.SEARCH.DATA_TYPES.EXPENSE:
                    case CONST.SEARCH.DATA_TYPES.INVOICE:
                    case CONST.SEARCH.DATA_TYPES.TRIP:
                        return GROUP_BY_FRIENDLY_VALUES;
                    default:
                        return [];
                }
            })();
            const filteredGroupBy = groupByAutocompleteList.filter(
                (groupByValue) => groupByValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(groupByValue.toLowerCase()),
            );
            return filteredGroupBy.map((groupByValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY, text: groupByValue}));
        }
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW: {
            const filteredViews = VIEW_FRIENDLY_VALUES.filter(
                (viewValue) => viewValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(viewValue.toLowerCase()),
            );
            return filteredViews.map((viewValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.VIEW, text: viewValue}));
        }
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
            const statusAutocompleteList = (() => {
                let suggestedStatuses;
                switch (currentType) {
                    case CONST.SEARCH.DATA_TYPES.EXPENSE:
                        suggestedStatuses = EXPENSE_STATUS_VALUES;
                        break;
                    case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
                        suggestedStatuses = EXPENSE_REPORT_STATUS_VALUES;
                        break;
                    case CONST.SEARCH.DATA_TYPES.INVOICE:
                        suggestedStatuses = INVOICE_STATUS_VALUES;
                        break;
                    case CONST.SEARCH.DATA_TYPES.TRIP:
                        suggestedStatuses = TRIP_STATUS_VALUES;
                        break;
                    case CONST.SEARCH.DATA_TYPES.TASK:
                        suggestedStatuses = TASK_STATUS_VALUES;
                        break;
                    default:
                        suggestedStatuses = DEFAULT_STATUS_VALUES;
                }
                return suggestedStatuses.filter((value) => value !== '').map((value) => getUserFriendlyValue(value));
            })();
            const filteredStatuses = statusAutocompleteList
                .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(status))
                .sort()
                .slice(0, 10);

            return filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.STATUS, text: status}));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
            const filteredExpenseTypes = EXPENSE_TYPE_FRIENDLY_VALUES.filter(
                (expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(expenseType),
            ).sort();

            return filteredExpenseTypes.map((expenseType) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE,
                text: expenseType,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE: {
            const filteredWithdrawalTypes = WITHDRAWAL_TYPE_VALUES.filter(
                (withdrawalType) => withdrawalType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(withdrawalType),
            ).sort();

            return filteredWithdrawalTypes.map((withdrawalType) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_TYPE,
                text: withdrawalType,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED: {
            // We don't want to show the "Expensify Card" feeds in the autocomplete suggestion list as they don't have real "Statements"
            // Thus passing an empty object to the `allCards` parameter.
            const feedAutoCompleteList = Object.values(getCardFeedsForDisplay(allFeeds, {}, translate, feedKeysWithCards));
            const filteredFeeds = feedAutoCompleteList
                .filter((feed) => feed.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(feed.name.toLowerCase()))
                .sort()
                .slice(0, 10);
            return filteredFeeds.map((feed) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.FEED,
                text: feed.name,
                autocompleteID: feed.id,
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
            const cardAutocompleteList = Object.values(allCards);
            const filteredCards = cardAutocompleteList
                .filter((card) => isCard(card) && !isCardHiddenFromSearch(card))
                .filter(
                    (card) =>
                        (card.bank.toLowerCase().includes(autocompleteValue.toLowerCase()) || card.lastFourPAN?.includes(autocompleteValue)) &&
                        !alreadyAutocompletedKeys.has(getCardDescription(card, translate).toLowerCase()),
                )
                .sort()
                .slice(0, 10);

            return filteredCards.map((card) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CARD_ID,
                text: getCardDescription(card, translate),
                autocompleteID: card.cardID.toString(),
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE: {
            const filteredValues = BOOLEAN_VALUES.filter((value) => value.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(value)).sort();

            return filteredValues.map((value) => ({
                filterKey: autocompleteKey,
                text: value,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
            const workspaceList: Array<{id: string; name: string}> = [];
            for (const singlePolicy of Object.values(policies)) {
                if (!singlePolicy || singlePolicy.isJoinRequestPending || !shouldShowPolicy(singlePolicy, false, currentUserEmail)) {
                    continue;
                }
                workspaceList.push({id: singlePolicy.id, name: singlePolicy.name ?? ''});
            }
            const filteredPolicies = workspaceList
                .filter((workspace) => workspace.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(workspace.name.toLowerCase()))
                .sort()
                .slice(0, 10);

            return filteredPolicies.map((workspace) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID,
                text: workspace.name,
                autocompleteID: workspace.id,
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION: {
            const filteredActionTypes = ACTION_FILTER_VALUES.filter((actionType) => {
                return actionType.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(actionType.toLowerCase());
            });

            return filteredActionTypes.map((action) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.ACTION,
                text: action,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS: {
            const hasAutocompleteList = getHasOptions(translate, currentType);
            const filteredHasValues = hasAutocompleteList.filter((hasValue) => {
                return hasValue.value.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(hasValue.value.toLowerCase());
            });

            return filteredHasValues.map((hasValue) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.HAS,
                text: hasValue.value,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS: {
            const isAutocompleteList = (() => {
                switch (currentType) {
                    case CONST.SEARCH.DATA_TYPES.CHAT:
                        return IS_VALUES_LIST;
                    default:
                        return [];
                }
            })();
            const filteredIsValues = isAutocompleteList.filter((isValue) => {
                return isValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(isValue.toLowerCase());
            });

            return filteredIsValues.map((isValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IS, text: isValue}));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO: {
            const filteredExportedTo = exportedToFilterOptions
                .filter((value) => {
                    const lowerValue = value.toLowerCase();
                    return lowerValue.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(lowerValue);
                })
                .sort()
                .slice(0, 10);
            return filteredExportedTo.map((value) => ({
                filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPORTED_TO,
                text: value,
                mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO,
            }));
        }
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED: {
            const filteredDatePresets = getDatePresets(autocompleteKey, true)
                .filter((datePreset) => datePreset.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(datePreset.toLowerCase()))
                .sort()
                .slice(0, 10);
            return filteredDatePresets.map((datePreset) => ({filterKey: autocompleteKey, text: datePreset}));
        }
        default: {
            return [];
        }
    }
}

export default useAutocompleteSuggestions;
export type {AutocompleteItemData};
