import React, {forwardRef, useCallback} from 'react';
import type {ForwardedRef} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {SearchQueryJSON} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SearchQueryListItem from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SectionListDataType, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ItemWithQuery = {
    query: string;
};

type SearchRouterListProps = {
    currentQuery: SearchQueryJSON | undefined;
    reportForContextualSearch?: OptionData;
    recentSearches: ItemWithQuery[] | undefined;
    recentReports: OptionData[];
    onSearchSubmit: (query: SearchQueryJSON | undefined) => void;
    updateUserSearchQuery: (newSearchQuery: string) => void;
    closeAndClearRouter: () => void;
};

function isSearchQueryListItem(listItem: UserListItemProps<OptionData> | SearchQueryListItemProps<SearchQueryItem>): listItem is SearchQueryListItemProps<SearchQueryItem> {
    if ('singleIcon' in listItem.item && listItem.item.singleIcon && 'query' in listItem.item && !!listItem.item.query) {
        return true;
    }
    return false;
}

function SearchRouterItem(props: UserListItemProps<OptionData> | SearchQueryListItemProps<SearchQueryItem>) {
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
            pressableStyle={styles.br2}
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

    if (reportForContextualSearch) {
        sections.push({
            data: [
                {
                    text: `${translate('search.searchIn')}${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: `in:${reportForContextualSearch.reportID}`,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    isContextualSearchItem: true,
                },
            ],
        });
    }

    const recentSearchesData = recentSearches?.map(({query}) => ({
        text: query,
        singleIcon: Expensicons.History,
        query,
        keyForList: query,
    }));

    if (recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const recentReportsData = recentReports.map((item) => ({...item, pressableStyle: styles.br2, itemType: CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.REPORT}));
    sections.push({title: translate('search.recentChats'), data: recentReportsData});

    const onSelectRow = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (!('query' in item) || !item.query) {
                // Handle selection of "Recent chat"
                closeAndClearRouter();
                if ('reportID' in item && item?.reportID) {
                    Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
                } else if ('login' in item) {
                    Report.navigateToAndOpenReport(item?.login ? [item.login] : []);
                }
                return;
            }

            if (item.isContextualSearchItem) {
                // Handle selection of "Contextual search suggestion"
                updateUserSearchQuery(`${item?.query} ${currentQuery?.inputQuery ?? ''}`);
                return;
            }

            // Handle selection of "Recent search"
            onSearchSubmit(SearchUtils.buildSearchQueryJSON(item?.query));
        },
        [closeAndClearRouter, onSearchSubmit, currentQuery, updateUserSearchQuery],
    );

    return (
        <SelectionList<OptionData | SearchQueryItem>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={styles.mh100}
            ref={ref}
        />
    );
}

export default forwardRef(SearchRouterList);
export {SearchRouterItem};
export type {ItemWithQuery};
