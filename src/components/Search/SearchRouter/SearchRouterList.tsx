import React, {forwardRef, useCallback} from 'react';
import type {ForwardedRef} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {SearchQueryJSON, SearchRouterListItem} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleIconListItem from '@components/SelectionList/Search/SingleIconListItem';
import type {ListItemWithSingleIcon, SingleIconListItemProps} from '@components/SelectionList/Search/SingleIconListItem';
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

function SearchRouterItem(props: UserListItemProps<SearchRouterListItem> | SingleIconListItemProps<SearchRouterListItem>) {
    const styles = useThemeStyles();
    if (props.item.itemType === CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.REPORT) {
        return (
            <UserListItem
                pressableStyle={styles.br2}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as UserListItemProps<OptionData>)}
            />
        );
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SingleIconListItem {...(props as SingleIconListItemProps<ListItemWithSingleIcon & ItemWithQuery>)} />;
}

function SearchRouterList(
    {currentQuery, reportForContextualSearch, recentSearches, recentReports, onSearchSubmit, updateUserSearchQuery, closeAndClearRouter}: SearchRouterListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const sections: Array<SectionListDataType<SearchRouterListItem>> = [];

    if (currentQuery?.inputQuery) {
        sections.push({
            data: [
                {
                    text: currentQuery?.inputQuery,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: currentQuery?.inputQuery,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'findItem',
                    itemType: CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.SEARCH,
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
                    itemType: CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                },
            ],
        });
    }

    const recentSearchesData = recentSearches?.map(({query}) => ({
        text: query,
        singleIcon: Expensicons.History,
        query,
        keyForList: query,
        itemType: CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.SEARCH,
    }));

    if (recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const recentReportsData = recentReports.map((item) => ({...item, pressableStyle: styles.br2, itemType: CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.REPORT}));
    sections.push({title: translate('search.recentChats'), data: recentReportsData});

    const onSelectRow = useCallback(
        (item: SearchRouterListItem) => {
            // eslint-disable-next-line default-case, @typescript-eslint/switch-exhaustiveness-check
            switch (item.itemType) {
                case CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.SEARCH:
                    // Handle selection of "Recent search"
                    if (!('query' in item) || !item?.query) {
                        return;
                    }
                    onSearchSubmit(SearchUtils.buildSearchQueryJSON(item?.query));
                    return;
                case CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.CONTEXTUAL_SUGGESTION:
                    // Handle selection of "Contextual search suggestion"
                    if (!('query' in item) || !item?.query || currentQuery?.inputQuery.includes(item?.query)) {
                        return;
                    }
                    updateUserSearchQuery(`${item?.query} ${currentQuery?.inputQuery ?? ''}`);
                    return;
                case CONST.SEARCH.ROUTER_LIST_ITEM_TYPE.REPORT:
                    // Handle selection of "Recent chat"
                    closeAndClearRouter();
                    if ('reportID' in item && item?.reportID) {
                        Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
                    } else if ('login' in item) {
                        Report.navigateToAndOpenReport(item?.login ? [item.login] : []);
                    }
            }
        },
        [closeAndClearRouter, onSearchSubmit, currentQuery, updateUserSearchQuery],
    );

    return (
        <SelectionList<SearchRouterListItem>
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
