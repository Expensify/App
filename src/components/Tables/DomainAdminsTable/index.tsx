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

import DomainAdminsTableRow from './DomainAdminsTableRow';

type DomainAdminsTableColumnKey = 'admin' | 'actions';

type DomainAdminRowData = TableData & {
    accountID: number;
    name: string;
    email: string;
    isPrimaryContact: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    dismissError: () => void;
};

type DomainAdminsTableProps = {
    domainAccountID: number;
    admins: DomainAdminRowData[];
};

export default function DomainAdminsTable({domainAccountID, admins}: DomainAdminsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<DomainAdminRowData, DomainAdminsTableColumnKey>>(null);
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

    const compareTableItems: CompareItemsCallback<DomainAdminRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainAdminRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainAdminRowData>) => (
        <DomainAdminsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );
    const tableHeaderComponent = <Table.FilterBar label={translate('domain.admins.findAdmin')} />;

    return (
        <Table
            ref={tableRef}
            data={admins}
            columns={domainAdminsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="admin"
            title={translate('domain.admins.title')}
            keyExtractor={(item) => item.keyForList}
            headerComponent={tableHeaderComponent}
            shouldUseStickyColumnHeader
        >
            <Table.NoResultsState />
            <Table.Body />
        </Table>
    );
}

export type {DomainAdminRowData, DomainAdminsTableColumnKey};
