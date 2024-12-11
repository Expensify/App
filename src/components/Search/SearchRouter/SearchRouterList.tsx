import {Str} from 'expensify-common';
import React, {forwardRef, useCallback, useEffect, useMemo, useState} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchFilterKey} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SearchQueryListItem, {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SectionListDataType, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    parseForAutocomplete,
} from '@libs/SearchAutocompleteUtils';
import * as SearchAutocompleteUtils from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as ReportUserActions from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import {getSubstitutionMapKey} from './getQueryWithSubstitutions';

type AutocompleteItemData = {
    filterKey: SearchFilterKey;
    text: string;
    autocompleteID?: string;
};

type SearchRouterListProps = {
    /** Value of TextInput */
    autocompleteQueryValue: string;

    /** An optional item to always display on the top of the router list  */
    searchQueryItem?: SearchQueryItem;

    /** Any extra sections that should be displayed in the router list */
    additionalSections?: Array<SectionListDataType<OptionData | SearchQueryItem>>;

    /** Callback to call when an item is clicked/selected */
    onListItemPress: (item: OptionData | SearchQueryItem) => void;

    /** Callback to call when user did not click an item but still text query should be changed */
    setTextQuery: (item: string) => void;

    /** Callback to call when the list of autocomplete substitutions should be updated */
    updateAutocompleteSubstitutions: (item: SearchQueryItem) => void;
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

// Todo rename to SearchAutocompleteList once it's used in both Router and SearchPage
function SearchRouterList(
    {autocompleteQueryValue, searchQueryItem, additionalSections, onListItemPress, setTextQuery, updateAutocompleteSubstitutions}: SearchRouterListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {activeWorkspaceID} = useActiveWorkspace();
    const policy = usePolicy(activeWorkspaceID);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return OptionsListUtils.getSearchOptions(options, betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    const [isInitialRender, setIsInitialRender] = useState(true);

    const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const statusAutocompleteList = Object.values({...CONST.SEARCH.STATUS.TRIP, ...CONST.SEARCH.STATUS.INVOICE, ...CONST.SEARCH.STATUS.CHAT, ...CONST.SEARCH.STATUS.TRIP});
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);

    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const cardAutocompleteList = Object.values(cardList);
    const participantsAutocompleteList = useMemo(() => {
        if (!areOptionsInitialized) {
            return [];
        }

        const filteredOptions = OptionsListUtils.getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS,
                includeSelfDM: true,
                showChatPreviewLine: true,
                shouldBoldTitleByDefault: false,
            },
        );

        // This cast is needed as something is incorrect in types OptionsListUtils.getOptions around l1490 and includeRecentReports types
        const personalDetailsFromOptions = filteredOptions.personalDetails.map((option) => (option as SearchOption<PersonalDetails>).item);
        const autocompleteOptions = Object.values(personalDetailsFromOptions)
            .filter((details): details is NonNullable<PersonalDetails> => !!(details && details?.login))
            .map((details) => {
                return {
                    name: details.displayName ?? Str.removeSMSDomain(details.login ?? ''),
                    accountID: details.accountID.toString(),
                };
            });
        const currentUser = filteredOptions.currentUserOption ? (filteredOptions.currentUserOption as SearchOption<PersonalDetails>).item : undefined;
        if (currentUser) {
            autocompleteOptions.push({
                name: currentUser.displayName ?? Str.removeSMSDomain(currentUser.login ?? ''),
                accountID: currentUser.accountID?.toString() ?? '-1',
            });
        }

        return autocompleteOptions;
    }, [areOptionsInitialized, options.personalDetails, options.reports]);

    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(taxRates, policy), [policy, taxRates]);

    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allRecentCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES);
    const categoryAutocompleteList = useMemo(() => {
        return getAutocompleteCategories(allPolicyCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allPolicyCategories]);
    const recentCategoriesAutocompleteList = useMemo(() => {
        return getAutocompleteRecentCategories(allRecentCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allRecentCategories]);

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const currencyAutocompleteList = Object.keys(currencyList ?? {});
    const [recentCurrencyAutocompleteList] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allRecentTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS);
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
                    .filter((tag) => tag.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tag))
                    .sort()
                    .slice(0, 10);

                return filteredTags.map((tagName) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                    text: tagName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
                const autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
                const filteredCategories = autocompleteList
                    .filter((category) => category.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(category.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCategories.map((categoryName) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
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
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
                    text: currencyName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                const filteredTaxRates = taxAutocompleteList
                    .filter((tax) => tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tax.taxRateName.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredTaxRates.map((tax) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
                    text: tax.taxRateName,
                    autocompleteID: tax.taxRateIds.join(','),
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
                const filteredParticipants = participantsAutocompleteList
                    .filter((participant) => participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                    .slice(0, 10);

                return filteredParticipants.map((participant) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO: {
                const filteredParticipants = participantsAutocompleteList
                    .filter((participant) => participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                    .slice(0, 10);

                return filteredParticipants.map((participant) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                const filteredChats = searchOptions.recentReports
                    .filter((chat) => chat.text?.toLowerCase()?.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(chat.text.toLowerCase()))
                    .slice(0, 10);

                return filteredChats.map((chat) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
                    text: chat.text ?? '',
                    autocompleteID: chat.reportID,
                }));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                const filteredTypes = typeAutocompleteList
                    .filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(type.toLowerCase()))
                    .sort();

                return filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, text: type}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                const filteredStatuses = statusAutocompleteList
                    .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(status))
                    .sort()
                    .slice(0, 10);

                return filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, text: status}));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                const filteredExpenseTypes = expenseTypes
                    .filter((expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(expenseType))
                    .sort();

                return filteredExpenseTypes.map((expenseType) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
                    text: expenseType,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                const filteredCards = cardAutocompleteList
                    .filter(
                        (card) =>
                            card.bank.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(CardUtils.getCardDescription(card.cardID).toLowerCase()),
                    )
                    .sort()
                    .slice(0, 10);

                return filteredCards.map((card) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
                    text: CardUtils.getCardDescription(card.cardID),
                    autocompleteID: card.cardID.toString(),
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
        participantsAutocompleteList,
        searchOptions.recentReports,
        typeAutocompleteList,
        statusAutocompleteList,
        expenseTypes,
        cardAutocompleteList,
    ]);

    const sortedRecentSearches = useMemo(() => {
        return Object.values(recentSearches ?? {}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [recentSearches]);

    const recentSearchesData = sortedRecentSearches?.slice(0, 5).map(({query, timestamp}) => {
        const searchQueryJSON = SearchQueryUtils.buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON ? SearchQueryUtils.buildUserReadableQueryString(searchQueryJSON, personalDetails, reports, taxRates) : query,
            singleIcon: Expensicons.History,
            searchQuery: query,
            keyForList: timestamp,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        };
    });

    const recentReportsOptions = useMemo(() => {
        if (autocompleteQueryValue.trim() === '') {
            return searchOptions.recentReports.slice(0, 20);
        }

        Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        const filteredOptions = OptionsListUtils.filterAndOrderOptions(searchOptions, autocompleteQueryValue, {sortByReportTypeInSearch: true, preferChatroomsOverThreads: true});
        Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);

        const reportOptions: OptionData[] = [...filteredOptions.recentReports, ...filteredOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reportOptions.push(filteredOptions.userToInvite);
        }
        return reportOptions.slice(0, 20);
    }, [autocompleteQueryValue, searchOptions]);

    useEffect(() => {
        ReportUserActions.searchInServer(autocompleteQueryValue.trim());
    }, [autocompleteQueryValue]);

    /* Sections generation */
    const sections: Array<SectionListDataType<OptionData | SearchQueryItem>> = [];

    if (searchQueryItem) {
        sections.push({data: [searchQueryItem]});
    }

    if (additionalSections) {
        sections.push(...additionalSections);
    }

    if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const styledRecentReports = recentReportsOptions.map((item) => ({...item, pressableStyle: styles.br2, wrapperStyle: [styles.pr3, styles.pl3]}));
    sections.push({title: translate('search.recentChats'), data: styledRecentReports});

    if (autocompleteSuggestions.length > 0) {
        const autocompleteData = autocompleteSuggestions.map(({filterKey, text, autocompleteID}) => {
            return {
                text: getSubstitutionMapKey(filterKey, text),
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

            const trimmedUserSearchQuery = SearchAutocompleteUtils.getQueryWithoutAutocompletedPart(autocompleteQueryValue);
            setTextQuery(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(focusedItem.searchQuery)} `);
            updateAutocompleteSubstitutions(focusedItem);
        },
        [autocompleteQueryValue, setTextQuery, updateAutocompleteSubstitutions],
    );

    return (
        <SelectionList<OptionData | SearchQueryItem>
            sections={sections}
            onSelectRow={onListItemPress}
            ListItem={SearchRouterItem}
            containerStyle={[styles.mh100]}
            sectionListStyle={[shouldUseNarrowLayout ? styles.ph5 : styles.ph2, styles.pb2]}
            listItemWrapperStyle={[styles.pr0, styles.pl0]}
            getItemHeight={getItemHeight}
            onLayout={() => {
                setPerformanceTimersEnd();
                setIsInitialRender(false);
            }}
            showScrollIndicator={!shouldUseNarrowLayout}
            sectionTitleStyles={styles.mhn2}
            shouldSingleExecuteRowSelect
            onArrowFocus={onArrowFocus}
            ref={ref}
            initiallyFocusedOptionKey={!shouldUseNarrowLayout ? styledRecentReports.at(0)?.keyForList : undefined}
            shouldScrollToFocusedIndex={!isInitialRender}
        />
    );
}

export default forwardRef(SearchRouterList);
export {SearchRouterItem};
