import {Str} from 'expensify-common';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import SelectionList from '@components/SelectionList';
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionList/Search/SearchQueryListItem';
import SearchQueryListItem, {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SectionListDataType, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useFastSearchFromOptions from '@hooks/useFastSearchFromOptions';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {getCardFeedKey, getCardFeedNamesWithType} from '@libs/CardFeedUtils';
import {getCardDescription, isCard, isCardHiddenFromSearch, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import memoize from '@libs/memoize';
import type {Options, SearchOption} from '@libs/OptionsListUtils';
import {combineOrderingOfReportsAndPersonalDetails, getSearchOptions, getValidPersonalDetailOptions} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {getAllTaxRates, getCleanedTagName, shouldShowPolicy} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    getQueryWithoutAutocompletedPart,
    parseForAutocomplete,
} from '@libs/SearchAutocompleteUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, sanitizeSearchValue, shouldHighlight} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import {getSubstitutionMapKey} from './SearchRouter/getQueryWithSubstitutions';
import type {SearchFilterKey, UserFriendlyKey} from './types';

type AutocompleteItemData = {
    filterKey: UserFriendlyKey;
    text: string;
    autocompleteID?: string;
    mapKey?: SearchFilterKey;
};

type GetAdditionalSectionsCallback = (options: Options) => Array<SectionListDataType<OptionData | SearchQueryItem>> | undefined;

type SearchAutocompleteListProps = {
    /** Value of TextInput */
    autocompleteQueryValue: string;

    /** An optional item to always display on the top of the router list  */
    searchQueryItem?: SearchQueryItem;

    /** Any extra sections that should be displayed in the router list. */
    getAdditionalSections?: GetAdditionalSectionsCallback;

    /** Callback to call when an item is clicked/selected */
    onListItemPress: (item: OptionData | SearchQueryItem) => void;

    /** Callback to call when user did not click an item but still text query should be changed */
    setTextQuery: (item: string) => void;

    /** Callback to call when the list of autocomplete substitutions should be updated */
    updateAutocompleteSubstitutions: (item: SearchQueryItem) => void;

    /** Whether to subscribe to KeyboardShortcut arrow keys events */
    shouldSubscribeToArrowKeyEvents?: boolean;

    /** Callback to highlight (e.g. scroll to) the first matched item in the list. */
    onHighlightFirstItem?: () => void;

    /** Ref for textInput */
    textInputRef?: React.RefObject<AnimatedTextInputRef>;
};

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    categoryOptions: [],
};

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.OPEN_SEARCH);
    Performance.markEnd(CONST.TIMING.OPEN_SEARCH);
};

function isSearchQueryListItem(listItem: UserListItemProps<OptionData> | SearchQueryListItemProps): listItem is SearchQueryListItemProps {
    return isSearchQueryItem(listItem.item);
}

function getAutocompleteDisplayText(filterKey: UserFriendlyKey, value: string) {
    return `${filterKey}:${value}`;
}

function getItemHeight(item: OptionData | SearchQueryItem) {
    if (isSearchQueryItem(item)) {
        return 44;
    }
    return 64;
}

function SearchRouterItem(props: UserListItemProps<OptionData> | SearchQueryListItemProps) {
    const styles = useThemeStyles();

    if (isSearchQueryListItem(props)) {
        return (
            <SearchQueryListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }
    return (
        <UserListItem
            pressableStyle={[styles.br2, styles.ph3]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchAutocompleteList(
    {
        autocompleteQueryValue,
        searchQueryItem,
        getAdditionalSections,
        onListItemPress,
        setTextQuery,
        updateAutocompleteSubstitutions,
        shouldSubscribeToArrowKeyEvents = true,
        onHighlightFirstItem,
        textInputRef,
    }: SearchAutocompleteListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {activeWorkspaceID} = useActiveWorkspace();
    const policy = usePolicy(activeWorkspaceID);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const taxRates = getAllTaxRates();

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions(options, betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    const [isInitialRender, setIsInitialRender] = useState(true);

    const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const groupByAutocompleteList = Object.values(CONST.SEARCH.GROUP_BY);
    const statusAutocompleteList = Object.values({
        ...CONST.SEARCH.STATUS.EXPENSE,
        ...CONST.SEARCH.STATUS.INVOICE,
        ...CONST.SEARCH.STATUS.CHAT,
        ...CONST.SEARCH.STATUS.TRIP,
        ...CONST.SEARCH.STATUS.TASK,
    });
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);
    const booleanTypes = Object.values(CONST.SEARCH.BOOLEAN);

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const cardAutocompleteList = Object.values(allCards);
    const cardFeedNamesWithType = useMemo(() => {
        return getCardFeedNamesWithType({workspaceCardFeeds, translate});
    }, [translate, workspaceCardFeeds]);
    const feedAutoCompleteList = useMemo(() => Object.entries(cardFeedNamesWithType).map(([cardFeedKey, cardFeedName]) => ({cardFeedKey, cardFeedName})), [cardFeedNamesWithType]);

    const getParticipantsAutocompleteList = useMemo(
        () =>
            memoize(() => {
                if (!areOptionsInitialized) {
                    return [];
                }

                const currentUserRef = {
                    current: undefined as OptionData | undefined,
                };
                const filteredOptions = getValidPersonalDetailOptions(options.personalDetails, {
                    loginsToExclude: CONST.EXPENSIFY_EMAILS_OBJECT,
                    shouldBoldTitleByDefault: false,
                    currentUserRef,
                });

                // This cast is needed as something is incorrect in types OptionsListUtils.getOptions around l1490 and includeRecentReports types
                const personalDetailsFromOptions = filteredOptions.map((option) => (option as SearchOption<PersonalDetails>).item);
                const autocompleteOptions = Object.values(personalDetailsFromOptions)
                    .filter((details): details is NonNullable<PersonalDetails> => !!details?.login)
                    .map((details) => {
                        return {
                            name: details.displayName ?? Str.removeSMSDomain(details.login ?? ''),
                            accountID: details.accountID.toString(),
                        };
                    });

                return autocompleteOptions;
            }),
        [areOptionsInitialized, options.personalDetails],
    );

    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(taxRates, policy), [policy, taxRates]);

    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const [allRecentCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES, {canBeMissing: true});
    const categoryAutocompleteList = useMemo(() => {
        return getAutocompleteCategories(allPolicyCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allPolicyCategories]);
    const recentCategoriesAutocompleteList = useMemo(() => {
        return getAutocompleteRecentCategories(allRecentCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allRecentCategories]);

    const [policies = {}] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email, canBeMissing: false});

    const workspaceList = useMemo(
        () =>
            Object.values(policies)
                .filter((singlePolicy) => !!singlePolicy && shouldShowPolicy(singlePolicy, false, currentUserLogin) && !singlePolicy?.isJoinRequestPending)
                .map((singlePolicy) => ({id: singlePolicy?.id, name: singlePolicy?.name ?? ''})),
        [policies, currentUserLogin],
    );

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: false});
    const currencyAutocompleteList = Object.keys(currencyList ?? {}).filter((currency) => !currencyList?.[currency]?.retired);
    const [recentCurrencyAutocompleteList] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: false});
    const [allRecentTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS, {canBeMissing: true});
    const tagAutocompleteList = useMemo(() => {
        return getAutocompleteTags(allPoliciesTags, activeWorkspaceID);
    }, [activeWorkspaceID, allPoliciesTags]);
    const recentTagsAutocompleteList = getAutocompleteRecentTags(allRecentTags, activeWorkspaceID);

    const autocompleteSuggestions = useMemo<AutocompleteItemData[]>(() => {
        const autocompleteParsedQuery = parseForAutocomplete(autocompleteQueryValue);
        const {autocomplete, ranges = []} = autocompleteParsedQuery ?? {};
        const autocompleteKey = autocomplete?.key;
        const autocompleteValue = autocomplete?.value ?? '';

        const alreadyAutocompletedKeys = ranges
            .filter((range) => {
                return autocompleteKey && range.key === autocompleteKey;
            })
            .map((range) => range.value.toLowerCase());

        switch (autocompleteKey) {
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
                const autocompleteList = autocompleteValue ? tagAutocompleteList : recentTagsAutocompleteList ?? [];
                const filteredTags = autocompleteList
                    .filter(
                        (tag) => getCleanedTagName(tag).toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(getCleanedTagName(tag).toLowerCase()),
                    )
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
                    .filter((category) => category.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(category.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCategories.map((categoryName) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CATEGORY,
                    text: categoryName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY: {
                const autocompleteList = autocompleteValue ? currencyAutocompleteList : recentCurrencyAutocompleteList ?? [];
                const filteredCurrencies = autocompleteList
                    .filter((currency) => currency.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(currency.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCurrencies.map((currencyName) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CURRENCY,
                    text: currencyName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                const filteredTaxRates = taxAutocompleteList
                    .filter((tax) => tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tax.taxRateName.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredTaxRates.map((tax) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE,
                    text: tax.taxRateName,
                    autocompleteID: tax.taxRateIds.join(','),
                    mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CREATED_BY:
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
                const filterKey = autocompleteKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CREATED_BY ? CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CREATED_BY : autocompleteKey;

                const filteredParticipants = getParticipantsAutocompleteList()
                    .filter((participant) => participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                    .slice(0, 10);

                return filteredParticipants.map((participant) => ({
                    filterKey,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                    mapKey: autocompleteKey,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                const filteredChats = searchOptions.recentReports
                    .filter((chat) => chat.text?.toLowerCase()?.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(chat.text.toLowerCase()))
                    .slice(0, 10);

                return filteredChats.map((chat) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN,
                    text: chat.text ?? '',
                    autocompleteID: chat.reportID,
                    mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
                }));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                const filteredTypes = typeAutocompleteList
                    .filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(type.toLowerCase()))
                    .sort();

                return filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE, text: type}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY: {
                const filteredGroupBy = groupByAutocompleteList.filter(
                    (groupByValue) => groupByValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(groupByValue.toLowerCase()),
                );
                return filteredGroupBy.map((groupByValue) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY, text: groupByValue}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                const filteredStatuses = statusAutocompleteList
                    .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(status))
                    .sort()
                    .slice(0, 10);

                return filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.STATUS, text: status}));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                const filteredExpenseTypes = expenseTypes
                    .filter((expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(expenseType))
                    .sort();

                return filteredExpenseTypes.map((expenseType) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE,
                    text: expenseType,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED: {
                const filteredFeeds = feedAutoCompleteList
                    .filter(
                        (feed) => feed.cardFeedName.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(feed.cardFeedName.name.toLowerCase()),
                    )
                    .sort()
                    .slice(0, 10);
                return filteredFeeds.map((feed) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.FEED,
                    text: feed.cardFeedName.name,
                    autocompleteID: feed.cardFeedName.type === 'domain' ? feed.cardFeedKey : getCardFeedKey(workspaceCardFeeds, feed.cardFeedKey),
                    mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                const filteredCards = cardAutocompleteList
                    .filter((card) => isCard(card) && !isCardHiddenFromSearch(card))
                    .filter(
                        (card) =>
                            (card.bank.toLowerCase().includes(autocompleteValue.toLowerCase()) || card.lastFourPAN?.includes(autocompleteValue)) &&
                            !alreadyAutocompletedKeys.includes(getCardDescription(card.cardID).toLowerCase()),
                    )
                    .sort()
                    .slice(0, 10);

                return filteredCards.map((card) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CARD_ID,
                    text: getCardDescription(card.cardID, allCards),
                    autocompleteID: card.cardID.toString(),
                    mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE: {
                const filteredValues = booleanTypes.filter((value) => value.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(value)).sort();

                return filteredValues.map((value) => ({
                    filterKey: autocompleteKey,
                    text: value,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
                const filteredPolicies = workspaceList
                    .filter((workspace) => workspace.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(workspace.name.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredPolicies.map((workspace) => ({
                    filterKey: CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID,
                    text: workspace.name,
                    autocompleteID: workspace.id,
                    mapKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
                }));
            }
            default: {
                return [];
            }
        }
    }, [
        autocompleteQueryValue,
        tagAutocompleteList,
        recentTagsAutocompleteList,
        categoryAutocompleteList,
        recentCategoriesAutocompleteList,
        currencyAutocompleteList,
        recentCurrencyAutocompleteList,
        taxAutocompleteList,
        getParticipantsAutocompleteList,
        searchOptions.recentReports,
        typeAutocompleteList,
        groupByAutocompleteList,
        statusAutocompleteList,
        expenseTypes,
        feedAutoCompleteList,
        workspaceCardFeeds,
        cardAutocompleteList,
        allCards,
        booleanTypes,
        workspaceList,
    ]);

    const sortedRecentSearches = useMemo(() => {
        return Object.values(recentSearches ?? {}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [recentSearches]);

    const recentSearchesData = sortedRecentSearches?.slice(0, 5).map(({query, timestamp}) => {
        const searchQueryJSON = buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON ? buildUserReadableQueryString(searchQueryJSON, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, policies) : query,
            singleIcon: Expensicons.History,
            searchQuery: query,
            keyForList: timestamp,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        };
    });

    /**
     * Builds a suffix tree and returns a function to search in it.
     */
    const filterOptions = useFastSearchFromOptions(searchOptions, {includeUserToInvite: true});

    const recentReportsOptions = useMemo(() => {
        if (autocompleteQueryValue.trim() === '') {
            return searchOptions.recentReports.slice(0, 20);
        }

        Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        const filteredOptions = filterOptions(autocompleteQueryValue);
        const orderedOptions = combineOrderingOfReportsAndPersonalDetails(filteredOptions, autocompleteQueryValue, {
            sortByReportTypeInSearch: true,
            preferChatRoomsOverThreads: true,
        });
        Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);

        const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reportOptions.push(filteredOptions.userToInvite);
        }
        return reportOptions.slice(0, 20);
    }, [autocompleteQueryValue, filterOptions, searchOptions]);

    useEffect(() => {
        searchInServer(autocompleteQueryValue.trim());
    }, [autocompleteQueryValue]);

    /* Sections generation */
    const sections: Array<SectionListDataType<OptionData | SearchQueryItem>> = [];

    if (searchQueryItem) {
        sections.push({data: [searchQueryItem]});
    }

    const additionalSections = useMemo(() => {
        return getAdditionalSections?.(searchOptions);
    }, [getAdditionalSections, searchOptions]);

    if (additionalSections) {
        sections.push(...additionalSections);
    }

    if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const styledRecentReports = recentReportsOptions.map((item) => ({
        ...item,
        pressableStyle: styles.br2,
        text: StringUtils.lineBreaksToSpaces(item.text),
        wrapperStyle: [styles.pr3, styles.pl3],
    }));
    sections.push({title: autocompleteQueryValue.trim() === '' ? translate('search.recentChats') : undefined, data: styledRecentReports});

    if (autocompleteSuggestions.length > 0) {
        const autocompleteData = autocompleteSuggestions.map(({filterKey, text, autocompleteID, mapKey}) => {
            return {
                text: getAutocompleteDisplayText(filterKey, text),
                mapKey: mapKey ? getSubstitutionMapKey(mapKey, text) : undefined,
                singleIcon: Expensicons.MagnifyingGlass,
                searchQuery: text,
                autocompleteID,
                keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
            };
        });

        sections.push({title: translate('search.suggestions'), data: autocompleteData});
    }

    const onArrowFocus = useCallback(
        (focusedItem: OptionData | SearchQueryItem) => {
            if (!isSearchQueryItem(focusedItem) || !focusedItem.searchQuery || focusedItem?.searchItemType !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION) {
                return;
            }

            const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(autocompleteQueryValue);
            setTextQuery(`${trimmedUserSearchQuery}${sanitizeSearchValue(focusedItem.searchQuery)}\u00A0`);
            updateAutocompleteSubstitutions(focusedItem);
        },
        [autocompleteQueryValue, setTextQuery, updateAutocompleteSubstitutions],
    );

    const sectionItemText = sections?.at(1)?.data?.[0]?.text ?? '';
    const normalizedReferenceText = useMemo(() => sectionItemText.toLowerCase(), [sectionItemText]);

    useEffect(() => {
        const targetText = autocompleteQueryValue;

        if (shouldHighlight(normalizedReferenceText, targetText)) {
            onHighlightFirstItem?.();
        }
    }, [autocompleteQueryValue, onHighlightFirstItem, normalizedReferenceText]);

    return (
        // On page refresh, when the list is rendered before options are initialized the auto-focusing on initiallyFocusedOptionKey
        // will fail because the list will be empty on first render so we only render after options are initialized.
        areOptionsInitialized && (
            <SelectionList<OptionData | SearchQueryItem>
                showLoadingPlaceholder={!areOptionsInitialized}
                fixedNumItemsForLoader={4}
                loaderSpeed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                sections={sections}
                onSelectRow={onListItemPress}
                ListItem={SearchRouterItem}
                containerStyle={[styles.mh100]}
                sectionListStyle={[styles.ph2, styles.pb2, styles.overscrollBehaviorContain]}
                listItemWrapperStyle={[styles.pr0, styles.pl0]}
                getItemHeight={getItemHeight}
                onLayout={() => {
                    setPerformanceTimersEnd();
                    setIsInitialRender(false);
                    if (!!textInputRef?.current && ref && 'current' in ref) {
                        ref.current?.updateExternalTextInputFocus?.(textInputRef.current.isFocused());
                    }
                }}
                showScrollIndicator={!shouldUseNarrowLayout}
                sectionTitleStyles={styles.mhn2}
                shouldSingleExecuteRowSelect
                onArrowFocus={onArrowFocus}
                ref={ref}
                initiallyFocusedOptionKey={!shouldUseNarrowLayout ? styledRecentReports.at(0)?.keyForList : undefined}
                shouldScrollToFocusedIndex={!isInitialRender}
                shouldSubscribeToArrowKeyEvents={shouldSubscribeToArrowKeyEvents}
                disableKeyboardShortcuts={!shouldSubscribeToArrowKeyEvents}
            />
        )
    );
}

export default forwardRef(SearchAutocompleteList);
export {SearchRouterItem};
export type {GetAdditionalSectionsCallback};
