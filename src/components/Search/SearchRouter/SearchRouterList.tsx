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

type RecentSearchObject = {
    query: string;
};

type SearchRouterListProps = {
    currentSearch: SearchQueryJSON | undefined;
    recentSearches: RecentSearchObject[] | undefined;
    recentReports: OptionData[];
    onRecentSearchSelect: (query: SearchQueryJSON | undefined, shouldAddToRecentSearch?: boolean) => void;
    closeAndClearRouter: () => void;
};

function SearchRouterItem(props: UserListItemProps<OptionData> | SingleIconListItemProps<ListItemWithSingleIcon>) {
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
    return <SingleIconListItem {...(props as SingleIconListItemProps<ListItemWithSingleIcon>)} />;
}

function SearchRouterList({currentSearch, recentSearches, recentReports, onRecentSearchSelect, closeAndClearRouter}: SearchRouterListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const sections: Array<SectionListDataType<OptionData | ListItemWithSingleIcon>> = [];

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

    const recentSearchesData = recentSearches?.map(({query}) => ({
        text: query,
        singleIcon: Expensicons.History,
        query,
        keyForList: query,
    }));
    sections.push({title: translate('search.recentSearches'), data: recentSearchesData});

    const recentReportsWithStyle = recentReports.map((item) => ({...item, pressableStyle: styles.br2}));
    sections.push({title: translate('search.recentChats'), data: recentReportsWithStyle});

    const onSelectRow = useCallback(
        (item: OptionData | ListItemWithSingleIcon) => {
            if (item?.query) {
                const queryJSON = SearchUtils.buildSearchQueryJSON(item?.query);
                onRecentSearchSelect(queryJSON, true);
                return;
            }
            closeAndClearRouter();
            if ((item as OptionData)?.reportID) {
                Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute((item as OptionData)?.reportID));
            } else {
                Report.navigateToAndOpenReport((item as OptionData)?.login ? [(item as OptionData)?.login] : []);
            }
        },
        [closeAndClearRouter, onRecentSearchSelect],
    );

    return (
        <SelectionList<OptionData | ListItemWithSingleIcon>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={styles.mt3}
        />
    );
}

export default SearchRouterList;
export {SearchRouterItem};
