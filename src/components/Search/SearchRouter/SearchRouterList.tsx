import React, {forwardRef, useCallback} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {SearchFilterKey, SearchQueryString} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SearchQueryListItem from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SectionListDataType, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getQueryWithoutAutocompletedPart} from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {getSubstitutionMapKey} from './getQueryWithSubstitutions';

type SearchQueryItemData = {
    query: string;
    text?: string;
};

type AutocompleteItemData = {
    filterKey: SearchFilterKey;
    text: string;
    autocompleteID?: string;
};

type SearchRouterListProps = {
    /** value of TextInput */
    textInputValue: string;

    /** Callback to update text input value along with autocomplete suggestions */
    updateSearchValue: (newValue: string) => void;

    /** Callback to update text input value */
    setTextInputValue: (text: string) => void;

    /** Recent searches */
    recentSearches: Array<SearchQueryItemData & {timestamp: string}> | undefined;

    /** Recent reports */
    recentReports: OptionData[];

    /** Autocomplete items */
    autocompleteSuggestions: AutocompleteItemData[] | undefined;

    /** Callback to submit query when selecting a list item */
    onSearchSubmit: (query: SearchQueryString) => void;

    /** Context present when opening SearchRouter from a report, invoice or workspace page */
    reportForContextualSearch?: OptionData;

    /** Callback to run when user clicks a suggestion item that contains autocomplete data */
    onAutocompleteSuggestionClick: (autocompleteKey: string, autocompleteID: string) => void;

    /** Callback to close and clear SearchRouter */
    closeRouter: () => void;
};

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.SEARCH_ROUTER_RENDER);
    Performance.markEnd(CONST.TIMING.SEARCH_ROUTER_RENDER);
};

function getContextualSearchQuery(item: SearchQueryItem) {
    if (item.roomType === CONST.SEARCH.DATA_TYPES.EXPENSE) {
        return `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${CONST.SEARCH.DATA_TYPES.EXPENSE} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${item.autocompleteID}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${CONST.SEARCH.DATA_TYPES.INVOICE} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${item.autocompleteID}`;
    }
    return `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${CONST.SEARCH.DATA_TYPES.CHAT} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
}

function isSearchQueryItem(item: OptionData | SearchQueryItem): item is SearchQueryItem {
    return 'searchItemType' in item;
}

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
            pressableStyle={[styles.br2]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchRouterList(
    {
        textInputValue,
        updateSearchValue,
        setTextInputValue,
        reportForContextualSearch,
        recentSearches,
        autocompleteSuggestions,
        recentReports,
        onSearchSubmit,
        onAutocompleteSuggestionClick,
        closeRouter,
    }: SearchRouterListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const sections: Array<SectionListDataType<OptionData | SearchQueryItem>> = [];

    if (textInputValue) {
        sections.push({
            data: [
                {
                    text: textInputValue,
                    singleIcon: Expensicons.MagnifyingGlass,
                    searchQuery: textInputValue,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'findItem',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
                },
            ],
        });
    }

    if (reportForContextualSearch && !textInputValue) {
        const reportQueryValue = reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? reportForContextualSearch.reportID;
        let type: ValueOf<typeof CONST.SEARCH.DATA_TYPES> = CONST.SEARCH.DATA_TYPES.CHAT;
        if (reportForContextualSearch.isInvoiceRoom) {
            type = CONST.SEARCH.DATA_TYPES.INVOICE;
        }
        if (reportForContextualSearch.isPolicyExpenseChat) {
            type = CONST.SEARCH.DATA_TYPES.EXPENSE;
        }
        sections.push({
            data: [
                {
                    text: `${translate('search.searchIn')} ${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    searchQuery: reportQueryValue,
                    autocompleteID: reportForContextualSearch.reportID,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                    roomType: type,
                },
            ],
        });
    }

    const autocompleteData = autocompleteSuggestions?.map(({filterKey, text, autocompleteID}) => {
        return {
            text: getSubstitutionMapKey(filterKey, text),
            singleIcon: Expensicons.MagnifyingGlass,
            searchQuery: text,
            autocompleteID,
            keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
        };
    });

    if (autocompleteData && autocompleteData.length > 0) {
        sections.push({title: translate('search.suggestions'), data: autocompleteData});
    }

    const recentSearchesData = recentSearches?.map(({query, timestamp}) => {
        const searchQueryJSON = SearchQueryUtils.buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON ? SearchQueryUtils.buildUserReadableQueryString(searchQueryJSON, personalDetails, cardList, reports, taxRates) : query,
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

    const onSelectRow = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    const searchQuery = getContextualSearchQuery(item);
                    updateSearchValue(`${searchQuery} `);

                    if (item.autocompleteID) {
                        const autocompleteKey = `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
                        onAutocompleteSuggestionClick(autocompleteKey, item.autocompleteID);
                    }
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
                    updateSearchValue(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(item.searchQuery)} `);

                    if (item.autocompleteID && item.text) {
                        onAutocompleteSuggestionClick(item.text, item.autocompleteID);
                    }
                    return;
                }

                onSearchSubmit(item.searchQuery);
            }

            // Handle selection of "Recent chat"
            closeRouter();
            if ('reportID' in item && item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                Report.navigateToAndOpenReport(item.login ? [item.login] : [], false);
            }
        },
        [closeRouter, textInputValue, onSearchSubmit, updateSearchValue, onAutocompleteSuggestionClick],
    );

    const onArrowFocus = useCallback(
        (focusedItem: OptionData | SearchQueryItem) => {
            if (!isSearchQueryItem(focusedItem) || focusedItem?.searchItemType !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION || !focusedItem.searchQuery) {
                return;
            }

            const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
            setTextInputValue(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(focusedItem.searchQuery)} `);

            if (focusedItem.autocompleteID && focusedItem.text) {
                onAutocompleteSuggestionClick(focusedItem.text, focusedItem.autocompleteID);
            }
        },
        [setTextInputValue, textInputValue, onAutocompleteSuggestionClick],
    );

    return (
        <SelectionList<OptionData | SearchQueryItem>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={[styles.mh100]}
            sectionListStyle={[shouldUseNarrowLayout ? styles.ph5 : styles.ph2, styles.pb2]}
            listItemWrapperStyle={[styles.pr3, styles.pl3]}
            getItemHeight={getItemHeight}
            onLayout={setPerformanceTimersEnd}
            ref={ref}
            showScrollIndicator={!shouldUseNarrowLayout}
            sectionTitleStyles={styles.mhn2}
            shouldSingleExecuteRowSelect
            onArrowFocus={onArrowFocus}
        />
    );
}

export default forwardRef(SearchRouterList);
export {SearchRouterItem};
export type {AutocompleteItemData};
