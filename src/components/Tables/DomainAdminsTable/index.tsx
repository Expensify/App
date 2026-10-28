import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';

import useDomainHighlightOnReturn from '@hooks/useDomainHighlightOnReturn';
import useLocalize from '@hooks/useLocalize';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useRef} from 'react';

import DomainAdminRequestsTableRow from './DomainAdminRequestsTableRow';
import DomainAdminsTableGroupHeaderRow from './DomainAdminsTableGroupHeaderRow';
import DomainAdminsTableRow from './DomainAdminsTableRow';

type DomainAdminsTableColumnKey = 'admin' | 'actions';

type DomainAdminGroupHeaderRowData = TableData & {
    rowType: typeof CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER;
    groupOrder: number;
    label: string;
};

type DomainAdminRequestRowData = TableData & {
    rowType: typeof CONST.DOMAIN.ADMINS.ROW_TYPE.REQUEST;
    groupOrder: number;
    accountID: number;
    name: string;
    email: string;
    canApprove: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    approve: () => void;
    deny: () => void;
    dismissError: () => void;
};

type DomainAdminRowData = TableData & {
    rowType: typeof CONST.DOMAIN.ADMINS.ROW_TYPE.ADMIN;
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
    requests: DomainAdminRequestRowData[];
};

export default function DomainAdminsTable({domainAccountID, admins, requests}: DomainAdminsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const tableRef = useRef<TableHandle<DomainAdminsTableRowData, DomainAdminsTableColumnKey>>(null);
    useDomainHighlightOnReturn(domainAccountID, 'admins', tableRef);

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
        requests.length > 0
            ? [
                  {
                      keyForList: 'group-requests',
                      rowType: CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER,
                      groupOrder: CONST.DOMAIN.ADMINS.GROUP_ORDER.REQUESTS,
                      label: translate('domain.admins.requests'),
                  },
                  ...requests,
                  {
                      keyForList: 'group-admins',
                      rowType: CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER,
                      groupOrder: CONST.DOMAIN.ADMINS.GROUP_ORDER.ADMINS,
                      label: translate('domain.admins.title'),
                  },
                  ...admins,
              ]
            : admins;

    const compareTableItems: CompareItemsCallback<DomainAdminsTableRowData> = (item1, item2, activeSorting) => {
        if (item1.groupOrder !== item2.groupOrder) {
            return item1.groupOrder - item2.groupOrder;
        }
        if (item1.rowType === CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER || item2.rowType === CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER) {
            return 0;
        }

        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainAdminsTableRowData> = (item, searchValue) => {
        if (item.rowType === CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER) {
            const groupRows = tableData.filter(
                (row): row is DomainAdminRequestRowData | DomainAdminRowData => row.rowType !== CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER && row.groupOrder === item.groupOrder,
            );
            return tokenizedSearch(groupRows, searchValue, (option) => [option.name, option.email]).length > 0;
        }

        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainAdminsTableRowData>) => {
        if (item.rowType === CONST.DOMAIN.ADMINS.ROW_TYPE.GROUP_HEADER) {
            return (
                <DomainAdminsTableGroupHeaderRow
                    item={item}
                    rowIndex={index}
                />
            );
        }

        if (item.rowType === CONST.DOMAIN.ADMINS.ROW_TYPE.REQUEST) {
            return (
                <DomainAdminRequestsTableRow
                    item={item}
                    rowIndex={index}
                />
            );
        }

        return (
            <DomainAdminsTableRow
                item={item}
                rowIndex={index}
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
