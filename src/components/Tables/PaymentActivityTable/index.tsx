import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';

import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import PaymentActivityTableRow from './PaymentActivityTableRow';

type PaymentActivityTableColumnKey = 'member';

type PaymentActivityRowData = TableData & {
    accountID: number;

    /** The active user's login (email/phone) */
    login: string;

    /** The active user's display name */
    name: string;

    /** The active user's formatted email/phone shown as the subtitle */
    email: string;
};

type PaymentActivityTableProps = {
    /** The active users billed for the month */
    activeUsers: PaymentActivityRowData[];

    /** Page-level content rendered above the table header inside the scrollable list */
    headerComponent?: React.ReactElement;
};

function PaymentActivityTable({activeUsers, headerComponent}: PaymentActivityTableProps) {
    const {translate, localeCompare} = useLocalize();
    const subscriptionPlan = useSubscriptionPlan();

    // The Collect plan has no concept of active users, so it counts members instead.
    const isCollectPlan = subscriptionPlan === CONST.POLICY.TYPE.TEAM;

    // The count always reflects every active user, not just the ones matching the search.
    const activeUsersLabel = translate(isCollectPlan ? 'subscription.paymentHistory.members' : 'subscription.paymentHistory.activeUsers', {count: activeUsers.length});

    const columns: Array<TableColumn<PaymentActivityTableColumnKey>> = [
        {
            key: 'member',
            label: activeUsersLabel,
            sortable: false,
        },
    ];

    const compareItems: CompareItemsCallback<PaymentActivityRowData, PaymentActivityTableColumnKey> = (item1, item2) => localeCompare(item1.name.toLowerCase(), item2.name.toLowerCase());

    const isItemInSearch: IsItemInSearchCallback<PaymentActivityRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email, option.login]);
        return results.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<PaymentActivityRowData>) => (
        <PaymentActivityTableRow
            item={item}
            rowIndex={index}
        />
    );

    // Short lists are easy to scan, so the search bar only shows once there are enough active users to search through.
    const shouldShowSearchBar = activeUsers.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const tableHeaderComponent = composeTableListHeader(
        headerComponent,
        shouldShowSearchBar ? <Table.FilterBar label={translate(isCollectPlan ? 'subscription.paymentHistory.findMember' : 'subscription.paymentHistory.findActiveUser')} /> : undefined,
    );

    return (
        <Table
            data={activeUsers}
            columns={columns}
            initialSortColumn="member"
            title={activeUsersLabel}
            renderItem={renderItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            keyExtractor={(item) => item.keyForList}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default PaymentActivityTable;

export type {PaymentActivityRowData};
