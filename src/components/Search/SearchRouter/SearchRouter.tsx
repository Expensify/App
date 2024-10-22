import {useNavigationState} from '@react-navigation/native';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useActiveWorkspaceFromNavigationState from '@hooks/useActiveWorkspaceFromNavigationState';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getAllTaxRates, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {parseForAutocomplete} from '@libs/SearchAutocompleteUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';
import type {ItemWithQuery} from './SearchRouterList';

const SEARCH_DEBOUNCE_DELAY = 150;
type SearchRouterProps = {
    onRouterClose: () => void;
};

function getAutoCompleteTagsList(allPoliciesTagsLists: OnyxCollection<PolicyTagLists>, policyID?: string) {
    const singlePolicyTagsList: PolicyTagLists | undefined = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    if (!singlePolicyTagsList) {
        const uniqueTagNames = new Set<string>();
        const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
        tagListsUnpacked
            .map((policyTagLists) => {
                return getTagNamesFromTagsLists(policyTagLists);
            })
            .flat()
            .forEach((tag) => uniqueTagNames.add(tag));
        return Array.from(uniqueTagNames);
    }
    return getTagNamesFromTagsLists(singlePolicyTagsList);
}

function getAutocompleteCategoriesList(allPolicyCategories: OnyxCollection<PolicyCategories>, policyID?: string) {
    const singlePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    if (!singlePolicyCategories) {
        const uniqueCategoryNames = new Set<string>();
        Object.values(allPolicyCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
        return Array.from(uniqueCategoryNames);
    }
    return Object.values(singlePolicyCategories ?? {}).map((category) => category.name);
}

function getAutocompleteTaxList(allTaxRates: Record<string, string[]>, policy?: OnyxEntry<Policy>) {
    if (policy) {
        return Object.keys(policy?.taxRates?.taxes ?? {}).map((taxRateName) => taxRateName);
    }
    return Object.keys(allTaxRates).map((taxRateName) => taxRateName);
}

function SearchRouter({onRouterClose}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<ItemWithQuery[] | undefined>([]);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    const taxRates = getAllTaxRates();

    const [textInputValue, debouncedInputValue, setTextInputValue] = useDebouncedState('', 500);
    const [userSearchQuery, setUserSearchQuery] = useState<SearchQueryJSON | undefined>(undefined);
    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });

    const activeWorkspaceID = useActiveWorkspaceFromNavigationState();
    const policy = usePolicy(activeWorkspaceID);
    const typesAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const statusesAutocompleteList = Object.values({...CONST.SEARCH.STATUS.TRIP, ...CONST.SEARCH.STATUS.INVOICE, ...CONST.SEARCH.STATUS.CHAT, ...CONST.SEARCH.STATUS.TRIP});
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const categoryAutocompleteList = useMemo(() => getAutocompleteCategoriesList(allPolicyCategories, activeWorkspaceID), [allPolicyCategories, activeWorkspaceID]);
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const currencyAutocompleteList = Object.keys(currencyList ?? {});
    const [allPoliciesTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const tagAutocompleteList = useMemo(() => getAutoCompleteTagsList(allPoliciesTagsLists, activeWorkspaceID), [allPoliciesTagsLists, activeWorkspaceID]);
    const allTaxRates = getAllTaxRates();
    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(allTaxRates, policy), [policy, allTaxRates]);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const cardsAutocompleteList = Object.values(cardList ?? {}).map((card) => card.bank);
    const personalDetails = usePersonalDetails();
    const participantsAutocompleteList = Object.values(personalDetails)
        .filter((details) => details && details?.login)
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        .map((details) => details?.login as string);

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

    const clearUserQuery = () => {
        setTextInputValue('');
        setUserSearchQuery(undefined);
    };

    const updateAutocomplete = useCallback(
        (autocompleteValue: string, autocompleteType?: ValueOf<typeof CONST.SEARCH.SYNTAX_ROOT_KEYS & typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>) => {
            switch (autocompleteType) {
                case 'tag': {
                    const filteredTags = tagAutocompleteList.filter((tag) => tag?.includes(autocompleteValue));
                    setAutocompleteSuggestions(
                        filteredTags.map((tagName) => ({
                            text: `tag:${tagName}`,
                            query: `${tagName}`,
                        })),
                    );
                    return;
                }
                case 'category': {
                    const filteredCategories = categoryAutocompleteList.filter((category) => category?.includes(autocompleteValue));
                    setAutocompleteSuggestions(
                        filteredCategories.map((categoryName) => ({
                            text: `category:${categoryName}`,
                            query: `${categoryName}`,
                        })),
                    );
                    return;
                }
                case 'currency': {
                    const filteredCurrencies = currencyAutocompleteList.filter((currency) => currency?.includes(autocompleteValue));
                    setAutocompleteSuggestions(
                        filteredCurrencies.map((currencyName) => ({
                            text: `currency:${currencyName}`,
                            query: `${currencyName}`,
                        })),
                    );
                    return;
                }
                case 'taxRate': {
                    const filteredTaxRates = taxAutocompleteList.filter((tax) => tax.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredTaxRates.map((tax) => ({text: `type:${tax}`, query: `${tax}`})));
                    return;
                }
                case 'from': {
                    const filteredParticipants = participantsAutocompleteList.filter((participant) => participant.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredParticipants.map((participant) => ({text: `from:${participant}`, query: `${participant}`})));
                    return;
                }
                case 'to': {
                    const filteredParticipants = participantsAutocompleteList.filter((participant) => participant.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredParticipants.map((participant) => ({text: `to:${participant}`, query: `${participant}`})));
                    return;
                }
                case 'type': {
                    const filteredTypes = typesAutocompleteList.filter((type) => type.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredTypes.map((type) => ({text: `type:${type}`, query: `${type}`})));
                    return;
                }
                case 'status': {
                    const filteredStatuses = statusesAutocompleteList.filter((status) => status.includes(autocompleteValue));
                    setAutocompleteSuggestions(filteredStatuses.map((status) => ({text: `status:${status}`, query: `${status}`})));
                    return;
                }
                case 'expenseType': {
                    const filteredExpenseTypes = expenseTypes.filter((expenseType) => expenseType.includes(autocompleteValue));
                    setAutocompleteSuggestions(
                        filteredExpenseTypes.map((expenseType) => ({
                            text: `expenseType:${expenseType}`,
                            query: `${expenseType}`,
                        })),
                    );
                    return;
                }
                case 'cardID': {
                    const filteredCards = cardsAutocompleteList.filter((card) => card.includes(autocompleteValue));
                    setAutocompleteSuggestions(
                        filteredCards.map((card) => ({
                            text: `expenseType:${card}`,
                            query: `${card}`,
                        })),
                    );
                    return;
                }
                default:
                    setAutocompleteSuggestions(undefined);
            }
        },
        [
            tagAutocompleteList,
            categoryAutocompleteList,
            currencyAutocompleteList,
            taxAutocompleteList,
            participantsAutocompleteList,
            typesAutocompleteList,
            statusesAutocompleteList,
            expenseTypes,
            cardsAutocompleteList,
        ],
    );

    const onSearchChange = useMemo(
        // eslint-disable-next-line react-compiler/react-compiler
        () =>
            debounce((userQuery: string) => {
                if (!userQuery) {
                    clearUserQuery();
                    listRef.current?.updateAndScrollToFocusedIndex(-1);
                    return;
                }
                const autocompleteParsedQuery = parseForAutocomplete(userQuery);
                updateAutocomplete(autocompleteParsedQuery?.autocomplete?.value ?? '', autocompleteParsedQuery?.autocomplete?.key);

                listRef.current?.updateAndScrollToFocusedIndex(0);
                const queryJSON = SearchUtils.buildSearchQueryJSON(userQuery);

                if (queryJSON) {
                    setUserSearchQuery(queryJSON);
                } else {
                    Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} user query failed to parse`, userQuery, false);
                }
            }, SEARCH_DEBOUNCE_DELAY),
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [updateAutocomplete],
    );

    const updateUserSearchQuery = (newSearchQuery: string) => {
        setTextInputValue(newSearchQuery);
        onSearchChange(newSearchQuery);
    };

    const closeAndClearRouter = useCallback(() => {
        onRouterClose();
        clearUserQuery();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRouterClose]);

    const onSearchSubmit = useCallback(
        (query: SearchQueryJSON | undefined) => {
            if (!query) {
                return;
            }
            onRouterClose();
            const standardizedQuery = SearchUtils.standardizeQueryJSON(query, cardList, taxRates);
            const queryString = SearchUtils.buildSearchQueryString(standardizedQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
            clearUserQuery();
        },
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onRouterClose],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        closeAndClearRouter();
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
                setValue={setTextInputValue}
                isFullWidth={shouldUseNarrowLayout}
                updateSearch={onSearchChange}
                onSubmit={() => {
                    onSearchSubmit(SearchUtils.buildSearchQueryJSON(textInputValue));
                }}
                routerListRef={listRef}
                shouldShowOfflineMessage
                wrapperStyle={[styles.border, styles.alignItemsCenter]}
                outerWrapperStyle={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]}
                wrapperFocusedStyle={[styles.borderColorFocus]}
                isSearchingForReports={isSearchingForReports}
            />
            <SearchRouterList
                currentQuery={userSearchQuery}
                reportForContextualSearch={contextualReportData}
                recentSearches={sortedRecentSearches?.slice(0, 5)}
                recentReports={recentReports}
                autocompleteItems={autocompleteSuggestions}
                onSearchSubmit={onSearchSubmit}
                updateUserSearchQuery={updateUserSearchQuery}
                closeAndClearRouter={closeAndClearRouter}
                ref={listRef}
            />
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
