import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import SingleIconListItem from '@components/SelectionList/Search/SingleIconListItem';
import type {ListItemWithSingleIcon, SingleIconListItemProps} from '@components/SelectionList/Search/SingleIconListItem';
import type {UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import type {OptionData} from '@libs/ReportUtils';

type RecentSearchObject = {
    name: string;
    query: string;
};

type SearchRouterListProps = {
    recentSearches: RecentSearchObject[];
    recentReports: OptionData[];
};

function SearchRouterItem(props: UserListItemProps<OptionData> | SingleIconListItemProps<ListItemWithSingleIcon>) {
    if ('item' in props && props.item.reportID) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <UserListItem {...(props as UserListItemProps<OptionData>)} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SingleIconListItem {...(props as SingleIconListItemProps<ListItemWithSingleIcon>)} />;
}

function SearchRouterList({recentSearches, recentReports}: SearchRouterListProps) {
    const recentSearchesData = recentSearches.map(({name, query}) => ({
        text: name,
        singleIcon: Expensicons.History,
        query,
    }));

    return (
        <SelectionList<OptionData | ListItemWithSingleIcon>
            sections={[
                {title: 'Recent searches', data: recentSearchesData},
                {title: 'Recent chats', data: recentReports},
            ]}
            onSelectRow={() => {}}
            ListItem={SearchRouterItem}
        />
    );
}

export default SearchRouterList;
export {SearchRouterItem};
