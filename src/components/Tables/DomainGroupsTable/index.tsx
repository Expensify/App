import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {DomainGroupRowData} from './DomainGroupsTableRow';
import DomainGroupsTableRow from './DomainGroupsTableRow';

type DomainGroupsTableColumnKey = 'name' | 'members' | 'actions';

type DomainGroupsTableProps = {
    groups: DomainGroupRowData[];
};

export default function DomainGroupsTable({groups}: DomainGroupsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const domainGroupsTableColumns: Array<TableColumn<DomainGroupsTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
        {
            key: 'members',
            label: translate('common.members'),
            sortable: true,
            width: variables.domainGroupsTableMembersColumnWidth,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.domainTableActionColumnWidth,
        },
    ];

    const compareTableItems: CompareItemsCallback<DomainGroupRowData, DomainGroupsTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'members') {
            return (item1.memberCount - item2.memberCount) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainGroupRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainGroupRowData>) => (
        <DomainGroupsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={groups}
            columns={domainGroupsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="name"
            title={translate('domain.groups.title')}
            keyExtractor={(item) => item.keyForList}
        >
            {groups.length >= CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('domain.groups.findGroup')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {DomainGroupRowData};
