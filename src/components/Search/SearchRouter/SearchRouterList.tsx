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
import * as SearchUtils from '@libs/SearchUtils';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ItemWithQuery = {
    query: string;
};

type SearchRouterListProps = {
    /** currentQuery value computed coming from parsed TextInput value */
    currentQuery: SearchQueryJSON | undefined;

    /** Recent searches */
    recentSearches: ItemWithQuery[] | undefined;

    /** Recent reports */
    recentReports: OptionData[];

    /** Callback to submit query when selecting a list item */
    onSearchSubmit: (query: SearchQueryJSON | undefined) => void;

    /** Context present when opening SearchRouter from a report, invoice or workspace page */
    reportForContextualSearch?: OptionData;

    /** Callback to update search query when selecting contextual suggestion */
    updateUserSearchQuery: (newSearchQuery: string) => void;

    /** Callback to close and clear SearchRouter */
    closeAndClearRouter: () => void;
};

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.SEARCH_ROUTER_OPEN);
    Performance.markEnd(CONST.TIMING.SEARCH_ROUTER_OPEN);
};

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
            wrapperStyle={[styles.pr3, styles.pl3]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchRouterList(
    {currentQuery, reportForContextualSearch, recentSearches, recentReports, onSearchSubmit, updateUserSearchQuery, closeAndClearRouter}: SearchRouterListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useResponsiveLayout();

    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const contextualQuery = `in:${reportForContextualSearch?.reportID}`;
    const sections: Array<SectionListDataType<OptionData | SearchQueryItem>> = [];

    if (currentQuery?.inputQuery) {
        sections.push({
            data: [
                {
                    text: currentQuery?.inputQuery,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: currentQuery?.inputQuery,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'findItem',
                },
            ],
        });
    }

    if (reportForContextualSearch && !currentQuery?.inputQuery?.includes(contextualQuery)) {
        sections.push({
            data: [
                {
                    text: `${translate('search.searchIn')} ${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: SearchUtils.getContextualSuggestionQuery(reportForContextualSearch.reportID),
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    isContextualSearchItem: true,
                },
            ],
        });
    }

    const recentSearchesData = recentSearches?.map(({query}) => {
        const searchQueryJSON = SearchUtils.buildSearchQueryJSON(query);
        return {
            text: searchQueryJSON ? SearchUtils.getSearchHeaderTitle(searchQueryJSON, personalDetails, cardList, reports, taxRates) : query,
            singleIcon: Expensicons.History,
            query,
            keyForList: query,
        };
    });

    if (!currentQuery?.inputQuery && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const styledRecentReports = recentReports.map((item) => ({...item, pressableStyle: styles.br2}));
    sections.push({title: translate('search.recentChats'), data: styledRecentReports});

    const onSelectRow = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (item.isContextualSearchItem) {
                    // Handle selection of "Contextual search suggestion"
                    updateUserSearchQuery(`${item?.query} ${currentQuery?.inputQuery ?? ''}`);
                    return;
                }

                // Handle selection of "Recent search"
                if (!item?.query) {
                    return;
                }
                onSearchSubmit(SearchUtils.buildSearchQueryJSON(item?.query));
            }

            // Handle selection of "Recent chat"
            closeAndClearRouter();
            if ('reportID' in item && item?.reportID) {
                Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                Report.navigateToAndOpenReport(item?.login ? [item.login] : []);
            }
        },
        [closeAndClearRouter, onSearchSubmit, currentQuery, updateUserSearchQuery],
    );

    return (
        <SelectionList<OptionData | SearchQueryItem>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={[styles.mh100]}
            sectionListStyle={[isSmallScreenWidth ? styles.ph5 : styles.ph2, styles.pb2]}
            onLayout={setPerformanceTimersEnd}
            ref={ref}
            showScrollIndicator={!isSmallScreenWidth}
            sectionTitleStyles={styles.mhn2}
        />
    );
}

export default forwardRef(SearchRouterList);
export {SearchRouterItem};
export type {ItemWithQuery};
