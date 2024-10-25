import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {AutocompleteRange, SearchQueryJSON} from '@components/Search/types';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useActiveWorkspaceFromNavigationState from '@hooks/useActiveWorkspaceFromNavigationState';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
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
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';
import type {ItemWithQuery} from './SearchRouterList';

type SearchRouterProps = {
    onRouterClose: () => void;
};

function SearchRouter({onRouterClose}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<ItemWithQuery[] | undefined>([]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    const [textInputValue, debouncedInputValue, setTextInputValue] = useDebouncedState('', 500);
    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });

    const activeWorkspaceID = useActiveWorkspaceFromNavigationState();
    const policy = usePolicy(activeWorkspaceID);
    const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const statusAutocompleteList = Object.values({...CONST.SEARCH.STATUS.TRIP, ...CONST.SEARCH.STATUS.INVOICE, ...CONST.SEARCH.STATUS.CHAT, ...CONST.SEARCH.STATUS.TRIP});
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);
    const allTaxRates = getAllTaxRates();
    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(allTaxRates, policy), [policy, allTaxRates]);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const cardAutocompleteList = Object.values(cardList ?? {}).map((card) => card.bank);
    const personalDetails = usePersonalDetails();
    const participantsAutocompleteList = Object.values(personalDetails)
        .filter((details) => details && details?.login)
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        .map((details) => details?.login as string);

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

    const sortedRecentSearches = useMemo(() => {
        return Object.values(recentSearches ?? {}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [recentSearches]);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null, categoryOptions: [], tagOptions: [], taxRatesOptions: []};
        }
        return OptionsListUtils.getSearchOptions(options, '', betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    const filteredOptions = useMemo(() => {
        if (debouncedInputValue.trim() === '') {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
            };
        }

        Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        const newOptions = OptionsListUtils.filterOptions(searchOptions, debouncedInputValue, {sortByReportTypeInSearch: true, preferChatroomsOverThreads: true});
        Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);

        return {
            recentReports: newOptions.recentReports,
            personalDetails: newOptions.personalDetails,
            userToInvite: newOptions.userToInvite,
        };
    }, [debouncedInputValue, searchOptions]);

    const recentReports: OptionData[] = useMemo(() => {
        if (debouncedInputValue === '') {
            return searchOptions.recentReports.slice(0, 10);
        }

        const reports: OptionData[] = [...filteredOptions.recentReports, ...filteredOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reports.push(filteredOptions.userToInvite);
        }
        return reports.slice(0, 10);
    }, [debouncedInputValue, filteredOptions, searchOptions]);

    useEffect(() => {
        Report.searchInServer(debouncedInputValue.trim());
    }, [debouncedInputValue]);

    const contextualReportData = contextualReportID ? searchOptions.recentReports?.find((option) => option.reportID === contextualReportID) : undefined;

    const updateAutocomplete = useCallback(
        (autocompleteValue: string, ranges: AutocompleteRange[], autocompleteType?: ValueOf<typeof CONST.SEARCH.SYNTAX_ROOT_KEYS & typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>) => {
            const alreadyAutocompletedKeys: string[] = [];
            ranges.forEach((range) => {
                if (!autocompleteType || range.key !== autocompleteType) {
                    return;
                }
                alreadyAutocompletedKeys.push(range.value);
            });
            switch (autocompleteType) {
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
                    const autocompleteList = autocompleteValue ? tagAutocompleteList : recentTagsAutocompleteList ?? [];
                    const filteredTags = autocompleteList.filter((tag) => tag?.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(tag));
                    setAutocompleteSuggestions(
                        filteredTags.map((tagName) => ({
                            text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG}:${tagName}`,
                            query: `${tagName}`,
                        })),
                    );
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
                    const autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
                    const filteredCategories = autocompleteList.filter((category) => {
                        return category?.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(category);
                    });
                    setAutocompleteSuggestions(
                        filteredCategories.map((categoryName) => ({
                            text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY}:${categoryName}`,
                            query: `${categoryName}`,
                        })),
                    );
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY: {
                    const autocompleteList = autocompleteValue ? currencyAutocompleteList : recentCurrencyAutocompleteList ?? [];
                    const filteredCurrencies = autocompleteList.filter((currency) => currency?.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(currency));
                    setAutocompleteSuggestions(
                        filteredCurrencies.map((currencyName) => ({
                            text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY}:${currencyName}`,
                            query: `${currencyName}`,
                        })),
                    );
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                    const filteredTaxRates = taxAutocompleteList.filter((tax) => tax.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(tax));
                    setAutocompleteSuggestions(filteredTaxRates.map((tax) => ({text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE}:${tax}`, query: `${tax}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
                    const filteredParticipants = participantsAutocompleteList.filter((participant) => participant.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredParticipants.map((participant) => ({text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM}:${participant}`, query: `${participant}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO: {
                    const filteredParticipants = participantsAutocompleteList.filter((participant) => participant.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredParticipants.map((participant) => ({text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${participant}`, query: `${participant}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                    const filteredChats = searchOptions.recentReports.filter((chat) => chat.text?.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredChats.map((chat) => ({text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${chat.text}`, query: `${chat.reportID}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                    const filteredTypes = typeAutocompleteList.filter((type) => type.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(type));
                    setAutocompleteSuggestions(filteredTypes.map((type) => ({text: `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${type}`, query: `${type}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                    const filteredStatuses = statusAutocompleteList.filter((status) => status.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(status));
                    setAutocompleteSuggestions(filteredStatuses.map((status) => ({text: `${CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS}:${status}`, query: `${status}`})));
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                    const filteredExpenseTypes = expenseTypes.filter((expenseType) => expenseType.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(expenseType));
                    setAutocompleteSuggestions(
                        filteredExpenseTypes.map((expenseType) => ({
                            text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE}:${expenseType}`,
                            query: `${expenseType}`,
                        })),
                    );
                    return;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                    const filteredCards = cardAutocompleteList.filter((card) => card.includes(autocompleteValue) && !alreadyAutocompletedKeys.includes(card));
                    setAutocompleteSuggestions(
                        filteredCards.map((card) => ({
                            text: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID}:${card}`,
                            query: `${card}`,
                        })),
                    );
                    return;
                }
                default: {
                    setAutocompleteSuggestions(undefined);
                }
            }
        },
        [
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
        ],
    );

    const onSearchChange = useCallback(
        (userQuery: string) => {
            setTextInputValue(userQuery);
            const autocompleteParsedQuery = parseForAutocomplete(userQuery);
            updateAutocomplete(autocompleteParsedQuery?.autocomplete?.value ?? '', autocompleteParsedQuery?.ranges ?? [], autocompleteParsedQuery?.autocomplete?.key);
            if (userQuery) {
                listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [setTextInputValue, updateAutocomplete],
    );

    const onSearchSubmit = useCallback(
        (query: SearchQueryJSON | undefined) => {
            if (!query) {
                return;
            }
            onRouterClose();
            const standardizedQuery = SearchQueryUtils.standardizeQueryJSON(query, cardList, allTaxRates);
            const queryString = SearchQueryUtils.buildSearchQueryString(standardizedQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
            setTextInputValue('');
        },
        [allTaxRates, cardList, onRouterClose, setTextInputValue],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        onRouterClose();
    });

    const modalWidth = shouldUseNarrowLayout ? styles.w100 : {width: variables.searchRouterPopoverWidth};

    return (
        <View
            style={[styles.flex1, modalWidth, styles.h100, !shouldUseNarrowLayout && styles.mh85vh]}
            testID={SearchRouter.displayName}
        >
            {shouldUseNarrowLayout && (
                <HeaderWithBackButton
                    title={translate('common.search')}
                    onBackButtonPress={() => onRouterClose()}
                />
            )}
            <SearchRouterInput
                value={textInputValue}
                isFullWidth={shouldUseNarrowLayout}
                updateSearch={onSearchChange}
                onSubmit={() => {
                    onSearchSubmit(SearchQueryUtils.buildSearchQueryJSON(textInputValue));
                }}
                routerListRef={listRef}
                shouldShowOfflineMessage
                wrapperStyle={[styles.border, styles.alignItemsCenter]}
                outerWrapperStyle={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]}
                wrapperFocusedStyle={[styles.borderColorFocus]}
                isSearchingForReports={isSearchingForReports}
            />
            <SearchRouterList
                textInputValue={textInputValue}
                updateSearchValue={onSearchChange}
                setTextInputValue={setTextInputValue}
                reportForContextualSearch={contextualReportData}
                recentSearches={sortedRecentSearches?.slice(0, 5)}
                recentReports={recentReports}
                autocompleteItems={autocompleteSuggestions}
                onSearchSubmit={onSearchSubmit}
                closeRouter={onRouterClose}
                ref={listRef}
            />
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
