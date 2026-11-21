import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

import useLocalize from '@hooks/useLocalize';

import tokenizedSearch from '@libs/tokenizedSearch';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import type {WorkspaceVendorTableRowData} from './WorkspaceVendorsTableRow';

import WorkspaceVendorsTableRow from './WorkspaceVendorsTableRow';

type WorkspaceVendorTableColumnKey = 'name' | 'enabled' | 'actions';

type WorkspaceVendorsTableProps = {
    /** Vendor rows to render */
    vendors: WorkspaceVendorTableRowData[];

    /** Whether row selection is enabled */
    selectionEnabled?: boolean;

    /** Currently selected vendor keys */
    selectedKeys?: string[];

    /** Callback fired when row selection changes */
    onRowSelectionChange?: (selectedKeys: string[]) => void;

    /** Page-level content rendered above the table header inside the scrollable list */
    headerComponent?: React.ReactElement;

    /** The actions the selected vendors support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>>;
};

function WorkspaceVendorsTable({vendors, selectionEnabled = false, selectedKeys = [], onRowSelectionChange, headerComponent, bulkActionOptions}: WorkspaceVendorsTableProps) {
    const {translate, localeCompare} = useLocalize();

    const columns: Array<TableColumn<WorkspaceVendorTableColumnKey, WorkspaceVendorTableRowData>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: item.name, fontSize: fontScale.text}],
            },
        },
        {
            key: 'enabled',
            label: translate('common.enabled'),
            sortable: true,
            width: variables.tableSwitchColumnWidth,
            styling: {
                alignment: CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END,
            },
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceVendorTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        if (activeSorting.columnKey === 'enabled') {
            const enabled1 = item1.enabled ? 1 : 0;
            const enabled2 = item2.enabled ? 1 : 0;
            return (enabled1 - enabled2) * orderMultiplier;
        }
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceVendorTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue.toLowerCase(), (option) => [option.name]);
        return results.length > 0;
    };

    const renderVendorItem = ({item, index}: ListRenderItemInfo<WorkspaceVendorTableRowData>) => (
        <WorkspaceVendorsTableRow
            item={item}
            rowIndex={index}
        />
    );

    const tableHeaderComponent = composeTableListHeader(headerComponent, <Table.FilterBar label={translate('workspace.vendors.findVendor')} />);

    return (
        <Table
            shouldUseDynamicColumns
            columnResizingID={CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_VENDORS}
            data={vendors}
            initialSortColumn="name"
            title={translate('workspace.common.vendors')}
            columns={columns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderVendorItem}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.EmptyState
                title={translate('workspace.vendors.emptyTitle')}
                subtitle={translate('workspace.vendors.emptySubtitle')}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
            {!!bulkActionOptions && <Table.BulkActionBar options={bulkActionOptions} />}
        </Table>
    );
}

export default WorkspaceVendorsTable;

export type {WorkspaceVendorTableRowData};
