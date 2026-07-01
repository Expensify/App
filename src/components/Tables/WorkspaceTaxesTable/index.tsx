import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import WorkspaceTaxesTableRow from './WorkspaceTaxesTableRow';
import type {WorkspaceTaxTableRowData} from './WorkspaceTaxesTableRow';

type WorkspaceTaxTableColumnKey = 'name' | 'enabled' | 'actions';

type WorkspaceTaxesTableProps = {
    taxes: WorkspaceTaxTableRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function WorkspaceTaxesTable({taxes, selectionEnabled, selectedKeys, onRowSelectionChange}: WorkspaceTaxesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const taxTableColumns: Array<TableColumn<WorkspaceTaxTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
        {
            key: 'enabled',
            label: translate('common.enabled'),
            sortable: true,
            width: variables.tableSwitchColumnWidth,
            styling: {
                containerStyles: [styles.justifyContentEnd],
            },
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceTaxTableRowData, WorkspaceTaxTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'enabled') {
            const enabled1 = item1.enabled ? 1 : 0;
            const enabled2 = item2.enabled ? 1 : 0;
            return (enabled1 - enabled2) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceTaxTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.alternateText]);
        return results.length > 0;
    };

    const renderTaxItem = ({item, index}: ListRenderItemInfo<WorkspaceTaxTableRowData>) => (
        <WorkspaceTaxesTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={taxes}
            initialSortColumn="name"
            narrowLayoutSortColumn="name"
            selectionEnabled={selectionEnabled}
            title={translate('workspace.common.taxes')}
            columns={taxTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderTaxItem}
            selectedKeys={selectedKeys}
            keyExtractor={(tax) => tax.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            {taxes.length >= CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.taxes.findTaxRate')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceTaxTableRowData, WorkspaceTaxTableColumnKey};
