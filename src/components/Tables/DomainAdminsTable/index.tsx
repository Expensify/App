import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';

import useDomainHighlightOnReturn from '@hooks/useDomainHighlightOnReturn';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useRef} from 'react';

import DomainAdminRequestsTableRow from './DomainAdminRequestsTableRow';
import DomainAdminsTableGroupHeaderRow from './DomainAdminsTableGroupHeaderRow';
import DomainAdminsTableRow from './DomainAdminsTableRow';

type DomainAdminsTableColumnKey = 'admin' | 'actions';

type DomainAdminGroupHeaderRowData = TableData & {
    rowType: 'groupHeader';
    groupOrder: number;
    label: string;
};

type DomainAdminRequestRowData = TableData & {
    rowType: 'request';
    groupOrder: number;
    accountID: number;
    name: string;
    email: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    approve: () => void;
    deny: () => void;
    dismissError: () => void;
};

type DomainAdminRowData = TableData & {
    rowType: 'admin';
    groupOrder: number;
    accountID: number;
    name: string;
    email: string;
    isPrimaryContact: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    dismissError: () => void;
};

type DomainAdminsTableRowData = DomainAdminGroupHeaderRowData | DomainAdminRequestRowData | DomainAdminRowData;

type DomainAdminsTableProps = {
    domainAccountID: number;
    admins: DomainAdminRowData[];
    requests?: DomainAdminRequestRowData[];
};

export default function DomainAdminsTable({domainAccountID, admins, requests}: DomainAdminsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<DomainAdminsTableRowData, DomainAdminsTableColumnKey>>(null);
    useDomainHighlightOnReturn(domainAccountID, 'admins', tableRef);

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const domainAdminsTableColumns: Array<TableColumn<DomainAdminsTableColumnKey>> = [
        {
            key: 'admin',
            label: translate('domain.admins.title'),
            sortable: true,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.domainAdminsTableActionColumnWidth,
        },
    ];

    const tableData: DomainAdminsTableRowData[] =
        requests && requests.length > 0
            ? [
                  {keyForList: 'group-requests', rowType: 'groupHeader', groupOrder: 0, label: translate('domain.admins.requests')},
                  ...requests,
                  {keyForList: 'group-admins', rowType: 'groupHeader', groupOrder: 1, label: translate('domain.admins.title')},
                  ...admins,
              ]
            : admins;

    const compareTableItems: CompareItemsCallback<DomainAdminsTableRowData> = (item1, item2, activeSorting) => {
        if (item1.groupOrder !== item2.groupOrder) {
            return item1.groupOrder - item2.groupOrder;
        }
        if (item1.rowType === 'groupHeader' || item2.rowType === 'groupHeader') {
            return 0;
        }

        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainAdminsTableRowData> = (item, searchValue) => {
        if (item.rowType === 'groupHeader') {
            return false;
        }

        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainAdminsTableRowData>) => {
        if (item.rowType === 'groupHeader') {
            return (
                <DomainAdminsTableGroupHeaderRow
                    item={item}
                    rowIndex={index}
                />
            );
        }

        if (item.rowType === 'request') {
            return (
                <DomainAdminRequestsTableRow
                    item={item}
                    rowIndex={index}
                    shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
                />
            );
        }

        return (
            <DomainAdminsTableRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };
    const tableHeaderComponent = <Table.FilterBar label={translate('domain.admins.findAdmin')} />;

    return (
        <Table
            ref={tableRef}
            data={tableData}
            columns={domainAdminsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            getItemType={(item) => item.rowType}
            initialSortColumn="admin"
            title={translate('domain.admins.title')}
            keyExtractor={(item) => item.keyForList}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {DomainAdminGroupHeaderRowData, DomainAdminRequestRowData, DomainAdminRowData, DomainAdminsTableColumnKey, DomainAdminsTableRowData};
