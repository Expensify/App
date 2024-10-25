import React, {forwardRef, useCallback} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {SearchQueryJSON} from '@components/Search/types';
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
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ItemWithQuery = {
    query: string;
    id?: string;
    text?: string;
};

type SearchRouterListProps = {
    /** value of TextInput */
    textInputValue: string;

    /** Callback to update text input value along with autocomplete suggestions */
    updateSearchValue: (newValue: string) => void;

    /** Callback to update text input value */
    setTextInputValue: (text: string) => void;

    /** Recent searches */
    recentSearches: Array<ItemWithQuery & {timestamp: string}> | undefined;

    /** Recent reports */
    recentReports: OptionData[];

    /** Autocomplete items */
    autocompleteItems: ItemWithQuery[] | undefined;

    /** Callback to submit query when selecting a list item */
    onSearchSubmit: (query: SearchQueryJSON | undefined) => void;

    /** Context present when opening SearchRouter from a report, invoice or workspace page */
    reportForContextualSearch?: OptionData;

    /** Callback to close and clear SearchRouter */
    closeRouter: () => void;
};

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.SEARCH_ROUTER_RENDER);
    Performance.markEnd(CONST.TIMING.SEARCH_ROUTER_RENDER);
};

function getContextualSearchQuery(reportID: string) {
    return `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${CONST.SEARCH.DATA_TYPES.CHAT} in:${reportID}`;
}

function isSearchQueryItem(item: OptionData | SearchQueryItem): item is SearchQueryItem {
    if ('singleIcon' in item && item.singleIcon && 'query' in item && item.query) {
        return true;
    }
    return false;
}

function isSearchQueryListItem(listItem: UserListItemProps<OptionData> | SearchQueryListItemProps): listItem is SearchQueryListItemProps {
    return isSearchQueryItem(listItem.item);
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
        updateSearchValue: updateTextInputValue,
        setTextInputValue,
        reportForContextualSearch,
        recentSearches,
        autocompleteItems,
        recentReports,
        onSearchSubmit,
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
                    query: textInputValue,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'findItem',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
                },
            ],
        });
    }

    if (reportForContextualSearch && !textInputValue) {
        sections.push({
            data: [
                {
                    text: `${translate('search.searchIn')} ${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: getContextualSearchQuery(reportForContextualSearch.reportID),
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                },
            ],
        });
    }

    const autocompleteData = autocompleteItems?.map(({text, query}) => {
        return {
            text,
            singleIcon: Expensicons.MagnifyingGlass,
            query,
            keyForList: query,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
        };
    });

    if (autocompleteData && autocompleteData.length > 0) {
        sections.push({title: translate('search.autocomplete'), data: autocompleteData});
    }

    const recentSearchesData = recentSearches?.map(({query, timestamp}) => {
        const searchQueryJSON = SearchQueryUtils.buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON ? SearchQueryUtils.buildUserReadableQueryString(searchQueryJSON, personalDetails, cardList, reports, taxRates) : query,
            singleIcon: Expensicons.History,
            query,
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
                if (!item?.query) {
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    updateTextInputValue(`${item?.query} `);
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const lastColonIndex = textInputValue.lastIndexOf(':');
                    const lastCommaIndex = textInputValue.lastIndexOf(',');
                    const trimmedUserSearchQuery = lastColonIndex > lastCommaIndex ? textInputValue.slice(0, lastColonIndex + 1) : textInputValue.slice(0, lastCommaIndex + 1);
                    updateTextInputValue(`${trimmedUserSearchQuery}${item?.query} `);
                    return;
                }

                onSearchSubmit(SearchQueryUtils.buildSearchQueryJSON(item?.query));
            }

            // Handle selection of "Recent chat"
            closeRouter();
            if ('reportID' in item && item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                Report.navigateToAndOpenReport(item.login ? [item.login] : [], false);
            }
        },
        [closeRouter, textInputValue, onSearchSubmit, updateTextInputValue],
    );

    const onArrowFocus = useCallback(
        (focusedItem: OptionData | SearchQueryItem) => {
            if (!isSearchQueryItem(focusedItem) || focusedItem.searchItemType !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION || !textInputValue) {
                return;
            }
            const lastColonIndex = textInputValue.lastIndexOf(':');
            const lastCommaIndex = textInputValue.lastIndexOf(',');
            const trimmedUserSearchQuery = lastColonIndex > lastCommaIndex ? textInputValue.slice(0, lastColonIndex + 1) : textInputValue.slice(0, lastCommaIndex + 1);
            setTextInputValue(`${trimmedUserSearchQuery}${focusedItem?.query} `);
        },
        [setTextInputValue, textInputValue],
    );

    const getItemHeight = useCallback((item: OptionData | SearchQueryItem) => {
        if (isSearchQueryItem(item)) {
            return 44;
        }
        return 64;
    }, []);

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
export type {ItemWithQuery};
