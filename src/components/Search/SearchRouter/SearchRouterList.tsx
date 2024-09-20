import React, {useCallback} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {SearchQueryJSON} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleIconListItem from '@components/SelectionList/Search/SingleIconListItem';
import type {ListItemWithSingleIcon, SingleIconListItemProps} from '@components/SelectionList/Search/SingleIconListItem';
import type {SectionListDataType, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as Report from '@userActions/Report';
import ROUTES from '@src/ROUTES';

type ItemWithQuery = {
    query: string;
};

type SearchRouterListProps = {
    currentSearch: SearchQueryJSON | undefined;
    reportForContextualSearch?: OptionData;
    recentSearches: ItemWithQuery[] | undefined;
    recentReports: OptionData[];
    onRecentSearchSelect: (query: SearchQueryJSON | undefined, shouldAddToRecentSearch?: boolean) => void;
    closeAndClearRouter: () => void;
};

function SearchRouterItem(props: UserListItemProps<OptionData> | SingleIconListItemProps<ListItemWithSingleIcon & ItemWithQuery>) {
    const styles = useThemeStyles();

    if ('item' in props && props.item.reportID) {
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

function SearchRouterList({currentSearch, reportForContextualSearch, recentSearches, recentReports, onRecentSearchSelect, closeAndClearRouter}: SearchRouterListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const sections: Array<SectionListDataType<OptionData | (ListItemWithSingleIcon & ItemWithQuery)>> = [];

    if (currentSearch?.inputQuery) {
        sections.push({
            data: [
                {
                    text: currentSearch?.inputQuery,
                    singleIcon: Expensicons.MagnifyingGlass,
                    query: currentSearch?.inputQuery,
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

    if (recentSearchesData) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData});
    }

    const recentReportsWithStyle = recentReports.map((item) => ({...item, pressableStyle: styles.br2}));
    sections.push({title: translate('search.recentChats'), data: recentReportsWithStyle});

    const onSelectRow = useCallback(
        (item: OptionData | ItemWithQuery) => {
            // This is case for handling selection of "Recent search"
            if ('query' in item && item?.query) {
                const queryJSON = SearchUtils.buildSearchQueryJSON(item?.query);
                onRecentSearchSelect(queryJSON, true);
                return;
            }

            // This is case for handling selection of "Recent chat"
            closeAndClearRouter();
            if ('reportID' in item && item?.reportID) {
                Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                Report.navigateToAndOpenReport(item?.login ? [item.login] : []);
            }
        },
        [closeAndClearRouter, onRecentSearchSelect],
    );

    return (
        <SelectionList<OptionData | (ListItemWithSingleIcon & ItemWithQuery)>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={styles.mt3}
        />
    );
}

export default SearchRouterList;
export {SearchRouterItem};
