import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TextInputProps} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchQueryString} from '@components/Search/types';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchAutocompleteUtils from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as ReportUserActions from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Report from '@src/types/onyx/Report';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getQueryWithSubstitutions} from './getQueryWithSubstitutions';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './getUpdatedSubstitutionsMap';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

function getContextualSearchAutocompleteKey(item: SearchQueryItem) {
    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.CHAT) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
    }
}

function getContextualSearchQuery(item: SearchQueryItem) {
    const baseQuery = `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${item.roomType}`;
    let additionalQuery = '';

    switch (item.roomType) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${item.policyID}`;
            if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE && item.autocompleteID) {
                additionalQuery += ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            }
            break;
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            break;
    }
    return baseQuery + additionalQuery;
}

type SearchRouterProps = {
    onRouterClose: () => void;
    shouldHideInputCaret?: TextInputProps['caretHidden'];
};

function SearchRouter({onRouterClose, shouldHideInputCaret}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});

    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();

    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    // The actual input text that the user sees
    const [textInputValue, debouncedInputValue, setTextInputValue] = useDebouncedState('', 500);
    // The input text that was last used for autocomplete; needed for the SearchRouterList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(textInputValue);

    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });

    const sortedRecentSearches = useMemo(() => {
        return Object.values(recentSearches ?? {}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [recentSearches]);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }
        return OptionsListUtils.getSearchOptions(options, betas ?? []);
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
            return searchOptions.recentReports.slice(0, 20);
        }

        const reportOptions: OptionData[] = [...filteredOptions.recentReports, ...filteredOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reportOptions.push(filteredOptions.userToInvite);
        }
        return reportOptions.slice(0, 20);
    }, [debouncedInputValue, filteredOptions, searchOptions]);

    const reportForContextualSearch = contextualReportID ? searchOptions.recentReports?.find((option) => option.reportID === contextualReportID) : undefined;

    useEffect(() => {
        ReportUserActions.searchInServer(debouncedInputValue.trim());
    }, [debouncedInputValue]);

    const sections = [];

    if (reportForContextualSearch && !textInputValue) {
        const reportQueryValue = reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? reportForContextualSearch.reportID;

        let roomType: ValueOf<typeof CONST.SEARCH.DATA_TYPES> = CONST.SEARCH.DATA_TYPES.CHAT;
        let autocompleteID = reportForContextualSearch.reportID;
        if (reportForContextualSearch.isInvoiceRoom) {
            roomType = CONST.SEARCH.DATA_TYPES.INVOICE;
            const report = reportForContextualSearch as SearchOption<Report>;
            if (report.item && report.item?.invoiceReceiver && report.item.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
                autocompleteID = report.item.invoiceReceiver.accountID.toString();
            } else {
                autocompleteID = '';
            }
        }
        if (reportForContextualSearch.isPolicyExpenseChat) {
            roomType = CONST.SEARCH.DATA_TYPES.EXPENSE;
            autocompleteID = reportForContextualSearch.policyID ?? '';
        }

        sections.push({
            data: [
                {
                    text: `${translate('search.searchIn')} ${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    searchQuery: reportQueryValue,
                    autocompleteID,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                    roomType,
                    policyID: reportForContextualSearch.policyID,
                },
            ],
        });
    }

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

    if (!textInputValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const styledRecentReports = recentReports.map((item) => ({...item, pressableStyle: styles.br2, wrapperStyle: [styles.pr3, styles.pl3]}));
    sections.push({title: translate('search.recentChats'), data: styledRecentReports});

    const searchQueryItem = textInputValue
        ? {
              text: textInputValue,
              singleIcon: Expensicons.MagnifyingGlass,
              searchQuery: textInputValue,
              itemStyle: styles.activeComponentBG,
              keyForList: 'findItem',
              searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
          }
        : undefined;

    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const updatedUserQuery = SearchAutocompleteUtils.getAutocompleteQueryWithComma(textInputValue, userQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(userQuery, autocompleteSubstitutions);
            setAutocompleteSubstitutions(updatedSubstitutionsMap);

            if (updatedUserQuery || textInputValue.length > 0) {
                listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const submitSearch = useCallback(
        (queryString: SearchQueryString) => {
            const cleanedQueryString = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const queryJSON = SearchQueryUtils.buildSearchQueryJSON(cleanedQueryString);
            if (!queryJSON) {
                return;
            }

            onRouterClose();

            const standardizedQuery = SearchQueryUtils.traverseAndUpdatedQuery(queryJSON, SearchQueryUtils.getUpdatedAmountValue);
            const query = SearchQueryUtils.buildSearchQueryString(standardizedQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));

            setTextInputValue('');
            setAutocompleteQueryValue('');
        },
        [autocompleteSubstitutions, onRouterClose, setTextInputValue],
    );

    const onListItemPress = (item: OptionData | SearchQueryItem) => {
        if (isSearchQueryItem(item)) {
            if (!item.searchQuery) {
                return;
            }

            if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                const searchQuery = getContextualSearchQuery(item);
                onSearchQueryChange(`${searchQuery} `);

                const autocompleteKey = getContextualSearchAutocompleteKey(item);
                if (autocompleteKey && item.autocompleteID) {
                    const substitutions = {...autocompleteSubstitutions, [autocompleteKey]: item.autocompleteID};

                    setAutocompleteSubstitutions(substitutions);
                }
            } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                const trimmedUserSearchQuery = SearchAutocompleteUtils.getQueryWithoutAutocompletedPart(textInputValue);
                onSearchQueryChange(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(item.searchQuery)} `);

                if (item.text && item.autocompleteID) {
                    const substitutions = {...autocompleteSubstitutions, [item.text]: item.autocompleteID};

                    setAutocompleteSubstitutions(substitutions);
                }
            } else {
                submitSearch(item.searchQuery);
            }
        } else {
            onRouterClose();

            if (item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                ReportUserActions.navigateToAndOpenReport(item.login ? [item.login] : [], false);
            }
        }
    };

    const onListItemFocus = (focusedItem: SearchQueryItem) => {
        if (!focusedItem.searchQuery) {
            return;
        }

        const trimmedUserSearchQuery = SearchAutocompleteUtils.getQueryWithoutAutocompletedPart(textInputValue);
        setTextInputValue(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(focusedItem.searchQuery)} `);

        if (focusedItem.autocompleteID && focusedItem.text) {
            const substitutions = {...autocompleteSubstitutions, [focusedItem.text]: focusedItem.autocompleteID};

            setAutocompleteSubstitutions(substitutions);
        }
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        onRouterClose();
    });

    const modalWidth = shouldUseNarrowLayout ? styles.w100 : {width: variables.searchRouterPopoverWidth};

    const isDataLoaded = useMemo(() => {
        return (!contextualReportID || contextualReportID !== undefined) && !isLoadingOnyxValue(recentSearchesMetadata) && recentReports.length > 0;
    }, [contextualReportID, recentSearchesMetadata, recentReports]);

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
            {(isDataLoaded || !!debouncedInputValue) && (
                <>
                    <SearchRouterInput
                        value={textInputValue}
                        isFullWidth={shouldUseNarrowLayout}
                        onSearchQueryChange={onSearchQueryChange}
                        onSubmit={() => {
                            submitSearch(textInputValue);
                        }}
                        caretHidden={shouldHideInputCaret}
                        routerListRef={listRef}
                        shouldShowOfflineMessage
                        wrapperStyle={[styles.border, styles.alignItemsCenter]}
                        outerWrapperStyle={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]}
                        wrapperFocusedStyle={[styles.borderColorFocus]}
                        isSearchingForReports={isSearchingForReports}
                    />
                    <SearchRouterList
                        autocompleteQueryValue={autocompleteQueryValue}
                        searchQueryItem={searchQueryItem}
                        additionalSections={sections}
                        onListItemPress={onListItemPress}
                        onListItemFocus={onListItemFocus}
                        initiallyFocusedOptionKey={isLargeScreenWidth ? styledRecentReports.at(0)?.keyForList : undefined}
                        ref={listRef}
                    />
                </>
            )}
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
