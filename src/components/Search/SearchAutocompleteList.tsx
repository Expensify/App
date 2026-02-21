// We use Date.now() and Math.random() for performance measurements
/* eslint-disable react-hooks/purity */
import type {ForwardedRef, RefObject} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {ListItem as NewListItem, UserListItemProps} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
// eslint-disable-next-line no-restricted-imports
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import SearchQueryListItem, {isSearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {getCardDescription, isCard, isCardHiddenFromSearch} from '@libs/CardUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import FS from '@libs/Fullstory';
import Log from '@libs/Log';
import type {Options, SearchOption} from '@libs/OptionsListUtils';
import {combineOrderingOfReportsAndPersonalDetails, getSearchOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import Performance from '@libs/Performance';
import {getAllTaxRates, getCleanedTagName, shouldShowPolicy} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    parseForAutocomplete,
} from '@libs/SearchAutocompleteUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, getQueryWithoutFilters, getUserFriendlyKey, getUserFriendlyValue, shouldHighlight} from '@libs/SearchQueryUtils';
import {getDatePresets, getHasOptions} from '@libs/SearchUIUtils';
import StringUtils from '@libs/StringUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import CONST, {CONTINUATION_DETECTION_SEARCH_FILTER_KEYS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import {getSubstitutionMapKey} from './SearchRouter/getQueryWithSubstitutions';
import type {SearchFilterKey, UserFriendlyKey} from './types';

type AutocompleteItemData = {
    filterKey: UserFriendlyKey;
    text: string;
    autocompleteID?: string;
    mapKey?: SearchFilterKey;
};

type AutocompleteListItem = NewListItem & Partial<Omit<OptionData, keyof NewListItem>> & Partial<Omit<SearchQueryItem, keyof NewListItem>>;

type GetAdditionalSectionsCallback = (options: Options, sectionIndex: number) => Array<Section<AutocompleteListItem>> | undefined;

type SearchAutocompleteListProps = {
    /** Value of TextInput */
    autocompleteQueryValue: string;

    /** Callback to trigger search action * */
    handleSearch: (value: string) => void;

    /** An optional item to always display on the top of the router list  */
    searchQueryItem?: SearchQueryItem;

    /** Any extra sections that should be displayed in the router list. */
    getAdditionalSections?: GetAdditionalSectionsCallback;

    /** Callback to call when an item is clicked/selected */
    onListItemPress: (item: OptionData | SearchQueryItem) => void;

    /** Whether to subscribe to KeyboardShortcut arrow keys events */
    shouldSubscribeToArrowKeyEvents?: boolean;

    /** Callback to highlight (e.g. scroll to) the first matched item in the list. */
    onHighlightFirstItem?: () => void;

    /** Ref for the external text input */
    textInputRef?: RefObject<AnimatedTextInputRef | null>;

    /** Personal details */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Reports */
    reports: OnyxCollection<Report>;

    /** All feeds */
    allFeeds: Record<string, CardFeeds | undefined> | undefined;

    /** All cards */
    allCards: CardList | undefined;

    /** Reference to the outer element */
    ref?: ForwardedRef<SelectionListWithSectionsHandle>;
};

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    categoryOptions: [],
};

const setPerformanceTimersEnd = () => {
    Performance.markEnd(CONST.TIMING.OPEN_SEARCH);
    endSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
};

function isSearchQueryListItem(listItem: UserListItemProps<AutocompleteListItem> | SearchQueryListItemProps): listItem is SearchQueryListItemProps {
    return isSearchQueryItem(listItem.item);
}

function getAutocompleteDisplayText(filterKey: UserFriendlyKey, value: string) {
    return `${filterKey}:${value}`;
}

function SearchRouterItem(props: UserListItemProps<AutocompleteListItem> | SearchQueryListItemProps) {
    const styles = useThemeStyles();

    if (isSearchQueryListItem(props)) {
        return (
            <SearchQueryListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }

    const fsClass = FS.getChatFSClass((props.item as SearchOption<Report> | undefined)?.item);

    return (
        <UserListItem
            pressableStyle={[styles.br2, styles.ph3]}
            forwardedFSClass={fsClass}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchAutocompleteList({
    autocompleteQueryValue,
    handleSearch,
    searchQueryItem,
    getAdditionalSections,
    onListItemPress,
    shouldSubscribeToArrowKeyEvents = true,
    onHighlightFirstItem,
    textInputRef,
    personalDetails,
    reports,
    allFeeds,
    allCards = CONST.EMPTY_OBJECT,
    ref,
}: SearchAutocompleteListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES, {canBeMissing: true});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['History', 'MagnifyingGlass']);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = (() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions({
            options,
            draftComments,
            nvpDismissedProductTraining,
            betas: betas ?? [],
            isUsedInChatFinder: true,
            includeReadOnly: true,
            searchQuery: autocompleteQueryValue,
            maxResults: CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS,
            includeUserToInvite: true,
            includeRecentReports: true,
            includeCurrentUser: true,
            countryCode,
            shouldShowGBR: false,
            shouldUnreadBeBold: true,
            loginList,
            currentUserAccountID,
            currentUserEmail,
            policyCollection: policies,
            personalDetails,
        });
    })();

    const [isInitialRender, setIsInitialRender] = useState(true);
    const prevQueryRef = useRef(autocompleteQueryValue);
    const innerListRef = useRef<SelectionListWithSectionsHandle | null>(null);
    const hasSetInitialFocusRef = useRef(false);

    // Callback ref to set both inner ref and forward to external ref
    const setListRef = (instance: SelectionListWithSectionsHandle | null) => {
        innerListRef.current = instance;
        if (typeof ref === 'function') {
            ref(instance);
        } else if (ref) {
            // Forwarded ref requires mutation when ref is an object ref (not a callback)
            // eslint-disable-next-line no-param-reassign
            ref.current = instance;
        }
    };

    // Reset focus when query changes to prevent stale focus on wrong items
    useEffect(() => {
        if (isInitialRender) {
            return;
        }

        const queryChanged = prevQueryRef.current !== autocompleteQueryValue;
        prevQueryRef.current = autocompleteQueryValue;

        if (queryChanged) {
            // When query changes, focus on the search query item (index 0) and scroll to top
            // onHighlightFirstItem will switch focus to the first result when there's a good match
            innerListRef.current?.updateAndScrollToFocusedIndex(0, true);
        }
    }, [autocompleteQueryValue, isInitialRender]);

    // Track external text input focus to prevent list items from stealing focus while typing
    useEffect(() => {
        if (!textInputRef?.current) {
            return;
        }

        // Update the list's internal focus tracking when the external input focus changes
        const updateFocus = () => {
            innerListRef.current?.updateExternalTextInputFocus(textInputRef.current?.isFocused() ?? false);
        };

        // Initial update
        updateFocus();

        // Note: We can't easily subscribe to focus/blur events on the ref, so we update on query changes
        // which happen when the user types (meaning input is focused)
    }, [textInputRef, autocompleteQueryValue]);

    const parsedQuery = parseForAutocomplete(autocompleteQueryValue);
    const typeFilter = parsedQuery?.ranges?.find((range) => range.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE);
    const currentType = (typeFilter?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE) as SearchDataTypes;

    const groupByAutocompleteList = (() => {
        switch (currentType) {
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
            case CONST.SEARCH.DATA_TYPES.INVOICE:
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return Object.values(CONST.SEARCH.GROUP_BY).map((value) => getUserFriendlyValue(value));
            default:
                return [];
        }
    })();

    const viewAutocompleteList = Object.values(CONST.SEARCH.VIEW).map((value) => getUserFriendlyValue(value));
    const statusAutocompleteList = (() => {
        let suggestedStatuses;
        switch (currentType) {
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
                suggestedStatuses = Object.values(CONST.SEARCH.STATUS.EXPENSE);
                break;
            case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
                suggestedStatuses = Object.values(CONST.SEARCH.STATUS.EXPENSE_REPORT);
                break;
            case CONST.SEARCH.DATA_TYPES.INVOICE:
                suggestedStatuses = Object.values(CONST.SEARCH.STATUS.INVOICE);
                break;
            case CONST.SEARCH.DATA_TYPES.TRIP:
                suggestedStatuses = Object.values(CONST.SEARCH.STATUS.TRIP);
                break;
            case CONST.SEARCH.DATA_TYPES.TASK:
                suggestedStatuses = Object.values(CONST.SEARCH.STATUS.TASK);
                break;
            default:
                suggestedStatuses = Object.values({
                    ...CONST.SEARCH.STATUS.EXPENSE,
                    ...CONST.SEARCH.STATUS.INVOICE,
                    ...CONST.SEARCH.STATUS.TRIP,
                    ...CONST.SEARCH.STATUS.TASK,
                });
        }
        return suggestedStatuses.filter((value) => value !== '').map((value) => getUserFriendlyValue(value));
    })();

    const hasAutocompleteList = getHasOptions(translate, currentType);
    const isAutocompleteList = (() => {
        switch (currentType) {
            case CONST.SEARCH.DATA_TYPES.CHAT:
                return Object.values(CONST.SEARCH.IS_VALUES);
            default:
                return [];
        }
    })();

    const cardAutocompleteList = Object.values(allCards);
    // We don't want to show the "Expensify Card" feeds in the autocomplete suggestion list as they don't have real "Statements"
    // Thus passing an empty object to the `allCards` parameter.
    const feedAutoCompleteList = Object.values(getCardFeedsForDisplay(allFeeds, {}, translate, feedKeysWithCards));

    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const [allRecentCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES, {canBeMissing: true});
    const categoryAutocompleteList = getAutocompleteCategories(allPolicyCategories);
    const recentCategoriesAutocompleteList = getAutocompleteRecentCategories(allRecentCategories);

    const taxRates = getAllTaxRates(policies);

    const taxAutocompleteList = getAutocompleteTaxList(taxRates);

    const workspaceList = (() => {
        const result = [];
        for (const singlePolicy of Object.values(policies)) {
            if (!singlePolicy || singlePolicy.isJoinRequestPending || !shouldShowPolicy(singlePolicy, false, currentUserEmail)) {
                continue;
            }

            result.push({id: singlePolicy.id, name: singlePolicy.name ?? ''});
        }

        return result;
    })();

    const {currencyList} = useCurrencyListState();
    const currencyAutocompleteList = Object.keys(currencyList).filter((currency) => !currencyList[currency]?.retired);
    const [recentCurrencyAutocompleteList] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: false});
    const [allRecentTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS, {canBeMissing: true});
    const tagAutocompleteList = getAutocompleteTags(allPoliciesTags);
    const recentTagsAutocompleteList = getAutocompleteRecentTags(allRecentTags);

    const [autocompleteParsedQuery, autocompleteQueryWithoutFilters] = (() => {
        const queryWithoutFilters = getQueryWithoutFilters(autocompleteQueryValue);
        return [parsedQuery, queryWithoutFilters];
    })();

    const autocompleteSuggestions: AutocompleteItemData[] = (() => {
        const {autocomplete, ranges = []} = autocompleteParsedQuery ?? {};

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

        const alreadyAutocompletedKeys = new Set(
            ranges
                .filter((range) => {
                    return autocompleteKey && range.key === autocompleteKey;
                })
                .map((range) => range.value.toLowerCase()),
        );

        switch (autocompleteKey) {
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
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
                const autocompleteList = autocompleteValue ? currencyAutocompleteList : (recentCurrencyAutocompleteList ?? []);
                const filteredCurrencies = autocompleteList
                    .filter((currency) => currency.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(currency.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCurrencies.map((currencyName) => ({
                    filterKey: getUserFriendlyKey(autocompleteKey),
                    text: currencyName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
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
                const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
                const filteredTypes = typeAutocompleteList
                    .filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(type.toLowerCase()))
                    .sort();

                return filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE, text: type}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY: {
                const filteredGroupBy = groupByAutocompleteList.filter(
                    (groupByValue) => groupByValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(groupByValue.toLowerCase()),
                );
                return filteredGroupBy.map((groupByValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY, text: groupByValue}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW: {
                const filteredViews = viewAutocompleteList.filter(
                    (viewValue) => viewValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(viewValue.toLowerCase()),
                );
                return filteredViews.map((viewValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.VIEW, text: viewValue}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                const filteredStatuses = statusAutocompleteList
                    .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(status))
                    .sort()
                    .slice(0, 10);

                return filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.STATUS, text: status}));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE).map((value) => getUserFriendlyValue(value));
                const filteredExpenseTypes = expenseTypes.filter((expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(expenseType)).sort();

                return filteredExpenseTypes.map((expenseType) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE,
                    text: expenseType,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE: {
                const withdrawalTypes = Object.values(CONST.SEARCH.WITHDRAWAL_TYPE);
                const filteredWithdrawalTypes = withdrawalTypes
                    .filter((withdrawalType) => withdrawalType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(withdrawalType))
                    .sort();

                return filteredWithdrawalTypes.map((withdrawalType) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_TYPE,
                    text: withdrawalType,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED: {
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
                const booleanTypes = Object.values(CONST.SEARCH.BOOLEAN);
                const filteredValues = booleanTypes.filter((value) => value.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(value)).sort();

                return filteredValues.map((value) => ({
                    filterKey: autocompleteKey,
                    text: value,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
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
                const filteredActionTypes = Object.values(CONST.SEARCH.ACTION_FILTERS).filter((actionType) => {
                    return actionType.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(actionType.toLowerCase());
                });

                return filteredActionTypes.map((action) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.ACTION,
                    text: action,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS: {
                const filteredHasValues = hasAutocompleteList.filter((hasValue) => {
                    return hasValue.value.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(hasValue.value.toLowerCase());
                });

                return filteredHasValues.map((hasValue) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.HAS,
                    text: hasValue.value,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS: {
                const filteredIsValues = isAutocompleteList.filter((isValue) => {
                    return isValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.has(isValue.toLowerCase());
                });

                return filteredIsValues.map((isValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IS, text: isValue}));
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
    })();

    const sortedRecentSearches = Object.values(recentSearches ?? {}).sort((a, b) => localeCompare(b.timestamp, a.timestamp));

    const recentSearchesData = sortedRecentSearches?.slice(0, 5).map(({query, timestamp}) => {
        const searchQueryJSON = buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON
                ? buildUserReadableQueryString({
                      queryJSON: searchQueryJSON,
                      PersonalDetails: personalDetails,
                      reports,
                      taxRates,
                      cardList: allCards,
                      cardFeeds: allFeeds,
                      policies,
                      currentUserAccountID,
                      autoCompleteWithSpace: false,
                      translate,
                      feedKeysWithCards,
                  })
                : query,
            singleIcon: expensifyIcons.History,
            searchQuery: query,
            keyForList: timestamp,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        };
    });

    const recentReportsOptions = (() => {
        const actionId = `filter_options_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const startTime = Date.now();

        Performance.markStart(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        Log.info('[CMD_K_DEBUG] Filter options started', false, {
            actionId,
            queryLength: autocompleteQueryValue.length,
            queryTrimmed: autocompleteQueryValue.trim(),
            recentReportsCount: searchOptions.recentReports.length,
            timestamp: startTime,
        });

        try {
            if (autocompleteQueryValue.trim() === '') {
                const endTime = Date.now();
                Performance.markEnd(CONST.TIMING.SEARCH_FILTER_OPTIONS);
                Log.info('[CMD_K_DEBUG] Filter options completed (empty query path)', false, {
                    actionId,
                    duration: endTime - startTime,
                    timestamp: endTime,
                });

                return searchOptions.recentReports;
            }

            const orderedOptions = combineOrderingOfReportsAndPersonalDetails(searchOptions, autocompleteQueryValue, {
                sortByReportTypeInSearch: true,
                preferChatRoomsOverThreads: true,
            });

            const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
            if (searchOptions.userToInvite) {
                reportOptions.push(searchOptions.userToInvite);
            }

            const finalOptions = reportOptions.slice(0, 20);
            const endTime = Date.now();
            Performance.markEnd(CONST.TIMING.SEARCH_FILTER_OPTIONS);
            Log.info('[CMD_K_DEBUG] Filter options completed (search path)', false, {
                actionId,
                duration: endTime - startTime,
                recentReportsFiltered: orderedOptions.recentReports.length,
                personalDetailsFiltered: orderedOptions.personalDetails.length,
                hasUserToInvite: !!searchOptions.userToInvite,
                finalResultCount: finalOptions.length,
                timestamp: endTime,
            });

            return finalOptions;
        } catch (error) {
            const endTime = Date.now();
            Performance.markEnd(CONST.TIMING.SEARCH_FILTER_OPTIONS);
            Log.alert('[CMD_K_FREEZE] Filter options failed', {
                actionId,
                error: String(error),
                duration: endTime - startTime,
                queryLength: autocompleteQueryValue.length,
                timestamp: endTime,
            });
            throw error;
        }
    })();

    const handleDebouncedSearch = (actionId: string, startTime: number) => {
        if (!handleSearch || !autocompleteQueryWithoutFilters) {
            Log.info('[CMD_K_DEBUG] Debounced search skipped - missing dependencies', false, {
                actionId,
                hasHandleSearch: !!handleSearch,
                hasQuery: !!autocompleteQueryWithoutFilters,
                timestamp: Date.now(),
            });
            return;
        }

        handleSearch(autocompleteQueryWithoutFilters);

        const endTime = Date.now();
        Performance.markEnd(CONST.TIMING.DEBOUNCE_HANDLE_SEARCH);
        Log.info('[CMD_K_DEBUG] Debounced search completed', false, {
            actionId,
            duration: endTime - startTime,
            queryLength: autocompleteQueryWithoutFilters.length,
            timestamp: endTime,
        });
    };

    const debounceHandleSearch = useDebounce(() => {
        const actionId = `debounce_search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const startTime = Date.now();

        Performance.markStart(CONST.TIMING.DEBOUNCE_HANDLE_SEARCH);
        Log.info('[CMD_K_DEBUG] Debounced search started', false, {
            actionId,
            queryLength: autocompleteQueryWithoutFilters?.length ?? 0,
            hasHandleSearch: !!handleSearch,
            timestamp: startTime,
        });

        try {
            handleDebouncedSearch(actionId, startTime);
        } catch (error) {
            const endTime = Date.now();
            Performance.markEnd(CONST.TIMING.DEBOUNCE_HANDLE_SEARCH);
            Log.alert('[CMD_K_FREEZE] Debounced search failed', {
                actionId,
                error: String(error),
                duration: endTime - startTime,
                queryLength: autocompleteQueryWithoutFilters?.length ?? 0,
                timestamp: endTime,
            });
            throw error;
        }
    }, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    useEffect(() => {
        debounceHandleSearch();
    }, [autocompleteQueryWithoutFilters, debounceHandleSearch]);

    /* Sections generation */
    const sections: Array<Section<AutocompleteListItem>> = [];
    let sectionIndex = 0;

    if (searchQueryItem) {
        sections.push({data: [searchQueryItem as AutocompleteListItem], sectionIndex: sectionIndex++});
    }

    const additionalSections = getAdditionalSections?.(searchOptions, sectionIndex);

    if (additionalSections) {
        for (const section of additionalSections) {
            sections.push(section);
            sectionIndex++;
        }
    }

    if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData as AutocompleteListItem[], sectionIndex: sectionIndex++});
    }
    const styledRecentReports = recentReportsOptions.map((option) => {
        const report = getReportOrDraftReport(option.reportID);
        const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
        const keyForList = option.keyForList ?? option.reportID ?? (option.accountID ? String(option.accountID) : undefined);
        return {
            ...option,
            keyForList,
            pressableStyle: styles.br2,
            text: StringUtils.lineBreaksToSpaces(shouldParserToHTML ? Parser.htmlToText(option.text ?? '') : (option.text ?? '')),
            wrapperStyle: [styles.pr3, styles.pl3],
        } as AutocompleteListItem;
    });

    sections.push({title: autocompleteQueryValue.trim() === '' ? translate('search.recentChats') : undefined, data: styledRecentReports, sectionIndex: sectionIndex++});

    if (autocompleteSuggestions.length > 0) {
        const autocompleteData: AutocompleteListItem[] = autocompleteSuggestions.map(({filterKey, text, autocompleteID, mapKey}) => {
            return {
                text: getAutocompleteDisplayText(filterKey, text),
                mapKey: mapKey ? getSubstitutionMapKey(mapKey, text) : undefined,
                singleIcon: expensifyIcons.MagnifyingGlass,
                searchQuery: text,
                autocompleteID,
                keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
            };
        });

        sections.push({title: translate('search.suggestions'), data: autocompleteData, sectionIndex: sectionIndex++});
    }

    const sectionItemText = sections?.at(1)?.data?.[0]?.text ?? '';
    const normalizedReferenceText = sectionItemText.toLowerCase();

    const firstRecentReportKey = styledRecentReports.at(0)?.keyForList;

    // When options initialize after the list is already mounted, initiallyFocusedItemKey has no effect
    // because useState(initialFocusedIndex) in useArrowKeyFocusManager only reads the initial value.
    // Imperatively focus the first recent report once options become available (desktop only).
    useEffect(() => {
        if (shouldUseNarrowLayout || !areOptionsInitialized || hasSetInitialFocusRef.current || !firstRecentReportKey) {
            return;
        }
        hasSetInitialFocusRef.current = true;

        // Compute the flat index of firstRecentReportKey by replicating the flattening logic
        // from useFlattenedSections: each section may prepend a header row when it has a title/customHeader.
        let flatIndex = 0;
        for (const section of sections) {
            const hasData = (section.data?.length ?? 0) > 0;
            const hasHeader = hasData && (section.title !== undefined || ('customHeader' in section && section.customHeader !== undefined));
            if (hasHeader) {
                flatIndex++;
            }
            for (const item of section.data ?? []) {
                if (item.keyForList === firstRecentReportKey) {
                    innerListRef.current?.updateAndScrollToFocusedIndex(flatIndex, false);
                    return;
                }
                flatIndex++;
            }
        }
    }, [areOptionsInitialized, firstRecentReportKey, shouldUseNarrowLayout]);

    useEffect(() => {
        const targetText = autocompleteQueryValue;

        if (shouldHighlight(normalizedReferenceText, targetText)) {
            onHighlightFirstItem?.();
        }
    }, [autocompleteQueryValue, onHighlightFirstItem, normalizedReferenceText]);

    return (
        <SelectionListWithSections<AutocompleteListItem>
            showLoadingPlaceholder
            sections={sections}
            onSelectRow={onListItemPress}
            ListItem={SearchRouterItem}
            style={{
                containerStyle: [styles.mh100],
                listStyle: [styles.ph2, styles.overscrollBehaviorContain],
                contentContainerStyle: styles.pb2,
                listItemWrapperStyle: [styles.pr0, styles.pl0],
                sectionTitleStyles: styles.mhn2,
            }}
            shouldSingleExecuteRowSelect
            ref={setListRef}
            initialScrollIndex={0}
            initiallyFocusedItemKey={!shouldUseNarrowLayout ? firstRecentReportKey : undefined}
            shouldScrollToFocusedIndex={!isInitialRender}
            disableKeyboardShortcuts={!shouldSubscribeToArrowKeyEvents}
            addBottomSafeAreaPadding
            onLayout={() => {
                setPerformanceTimersEnd();
                setIsInitialRender(false);
                innerListRef.current?.updateExternalTextInputFocus(textInputRef?.current?.isFocused() ?? false);
            }}
        />
    );
}

SearchAutocompleteList.displayName = 'SearchAutocompleteList';

export default React.memo(SearchAutocompleteList);
export {SearchRouterItem};
export type {GetAdditionalSectionsCallback};
