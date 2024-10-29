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
import useActiveWorkspace from '@hooks/useActiveWorkspace';
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
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import {getQueryWithSubstitutions} from './getQueryWithSubstitutions';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './getUpdatedSubstitutionsMap';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';
import type {AutocompleteItemData} from './SearchRouterList';

type SearchRouterProps = {
    onRouterClose: () => void;
};

function SearchRouter({onRouterClose}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteItemData[] | undefined>([]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [textInputValue, debouncedInputValue, setTextInputValue] = useDebouncedState('', 500);
    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });

    const cleanQuery = useMemo(() => {
        return getQueryWithSubstitutions(textInputValue, autocompleteSubstitutions);
    }, [autocompleteSubstitutions, textInputValue]);

    const {activeWorkspaceID} = useActiveWorkspace();
    const policy = usePolicy(activeWorkspaceID);

    const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const statusAutocompleteList = Object.values({...CONST.SEARCH.STATUS.TRIP, ...CONST.SEARCH.STATUS.INVOICE, ...CONST.SEARCH.STATUS.CHAT, ...CONST.SEARCH.STATUS.TRIP});
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const cardAutocompleteList = Object.values(cardList ?? {}).map((card) => card.bank);
    const personalDetailsForParticipants = usePersonalDetails();
    const participantsAutocompleteList = Object.values(personalDetailsForParticipants)
        .filter((details): details is NonNullable<PersonalDetails> => !!(details && details?.login))
        .map((details) => ({
            name: details.login ?? '',
            accountID: details?.accountID.toString(),
        }));
    const allTaxRates = getAllTaxRates();
    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(allTaxRates, policy), [policy, allTaxRates]);
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
                alreadyAutocompletedKeys.push(range.value.toLowerCase());
            });

            let filteredAutocompleteSuggestions: AutocompleteItemData[] | undefined;
            switch (autocompleteType) {
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
                    const autocompleteList = autocompleteValue ? tagAutocompleteList : recentTagsAutocompleteList ?? [];
                    const filteredTags = autocompleteList
                        .filter((tag) => tag.toLowerCase()?.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tag))
                        .sort()
                        .slice(0, 10);

                    filteredAutocompleteSuggestions = filteredTags.map((tagName) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                        text: tagName,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
                    const autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
                    const filteredCategories = autocompleteList
                        .filter((category) => {
                            return category.toLowerCase()?.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(category.toLowerCase());
                        })
                        .sort()
                        .slice(0, 10);

                    filteredAutocompleteSuggestions = filteredCategories.map((categoryName) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                        text: categoryName,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY: {
                    const autocompleteList = autocompleteValue ? currencyAutocompleteList : recentCurrencyAutocompleteList ?? [];
                    const filteredCurrencies = autocompleteList
                        .filter((currency) => currency.toLowerCase()?.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(currency.toLowerCase()))
                        .sort()
                        .slice(0, 10);

                    filteredAutocompleteSuggestions = filteredCurrencies.map((currencyName) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
                        text: currencyName,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                    const filteredTaxRates = taxAutocompleteList
                        .filter((tax) => tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tax.taxRateName.toLowerCase()))
                        .sort()
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredTaxRates.map((tax) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
                        text: tax.taxRateName,
                        autocompleteID: tax.taxRateIds.join(','),
                    }));

                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
                    const filteredParticipants = participantsAutocompleteList
                        .filter((participant) => participant.name.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                        .sort()
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredParticipants.map((participant) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                        text: participant.name,
                        autocompleteID: participant.accountID,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO: {
                    const filteredParticipants = participantsAutocompleteList
                        .filter((participant) => participant.name.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                        .sort()
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredParticipants.map((participant) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
                        text: participant.name,
                        autocompleteID: participant.accountID,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                    const filteredChats = searchOptions.recentReports
                        .filter((chat) => chat.text?.toLowerCase()?.includes(autocompleteValue.toLowerCase()))
                        .sort((chatA, chatB) => (chatA > chatB ? 1 : -1))
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredChats.map((chat) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
                        text: chat.text ?? '',
                        autocompleteID: chat.reportID,
                    }));
                    break;
                }
                case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                    const filteredTypes = typeAutocompleteList
                        .filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(type.toLowerCase()))
                        .sort();
                    filteredAutocompleteSuggestions = filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, text: type}));
                    break;
                }
                case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                    const filteredStatuses = statusAutocompleteList
                        .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(status))
                        .sort()
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, text: status}));
                    break;
                }
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                    const filteredExpenseTypes = expenseTypes
                        .filter((expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(expenseType))
                        .sort();

                    filteredAutocompleteSuggestions = filteredExpenseTypes.map((expenseType) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
                        text: expenseType,
                    }));
                    break;
                }
                // Fixme implement card autocomplete ids
                case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                    const filteredCards = cardAutocompleteList
                        .filter((card) => card.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(card.toLowerCase()))
                        .sort()
                        .slice(0, 10);
                    filteredAutocompleteSuggestions = filteredCards.map((card) => ({
                        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
                        text: card,
                    }));
                    break;
                }
                default: {
                    filteredAutocompleteSuggestions = undefined;
                }
            }
            setAutocompleteSuggestions(filteredAutocompleteSuggestions);
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
            let newUserQuery = userQuery;
            if (autocompleteSuggestions && userQuery.endsWith(',')) {
                newUserQuery = `${userQuery.slice(0, userQuery.length - 1).trim()},`;
            }
            setTextInputValue(newUserQuery);
            const autocompleteParsedQuery = parseForAutocomplete(newUserQuery);
            updateAutocomplete(autocompleteParsedQuery?.autocomplete?.value ?? '', autocompleteParsedQuery?.ranges ?? [], autocompleteParsedQuery?.autocomplete?.key);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(userQuery, autocompleteSubstitutions);
            setAutocompleteSubstitutions(updatedSubstitutionsMap);

            if (newUserQuery) {
                listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [autocompleteSubstitutions, autocompleteSuggestions, setTextInputValue, updateAutocomplete],
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

    const updateSubstitutionsMap = (key: string, value: string) => {
        const substitutions = {...autocompleteSubstitutions, [key]: {value}};

        setAutocompleteSubstitutions(substitutions);
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        onRouterClose();
    });

    const modalWidth = shouldUseNarrowLayout ? styles.w100 : {width: variables.searchRouterPopoverWidth};

    // console.log('[ROUTER]', {user: textInputValue, cleanQuery, autocompleteSubstitutions});

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
                    onSearchSubmit(SearchQueryUtils.buildSearchQueryJSON(cleanQuery));
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
                onAutocompleteSuggestionClick={updateSubstitutionsMap}
                ref={listRef}
            />
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
