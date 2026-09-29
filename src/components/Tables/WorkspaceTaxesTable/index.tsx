import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';
import compareOptionalValues from '@components/Table/compareOptionalValues';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import type {WorkspaceTaxTableRowData} from './WorkspaceTaxesTableRow';

import WorkspaceTaxesTableRow from './WorkspaceTaxesTableRow';

type WorkspaceTaxTableColumnKey = 'name' | 'taxRate' | 'taxCode' | 'enabled' | 'actions';

type WorkspaceTaxesTableProps = {
    taxes: WorkspaceTaxTableRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];

    /** Whether the workspace has tax codes worth a column. Narrow and medium layouts hide it regardless. */
    shouldShowTaxCodeColumn: boolean;

    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;
};

/**
 * Sorts rate values numerically rather than as text, so "9%" comes before "10%".
 */
function compareTaxRateValues(value1: string, value2: string): number {
    return Number.parseFloat(value1) - Number.parseFloat(value2);
}

/**
 * Returns the rate value only when it holds a number, so one that does not parse can be treated as missing.
 */
function getNumericTaxRateValue(value: string): string | undefined {
    return Number.isNaN(Number.parseFloat(value)) ? undefined : value;
}

export default function WorkspaceTaxesTable({taxes, selectionEnabled, selectedKeys, shouldShowTaxCodeColumn, onRowSelectionChange, headerComponent}: WorkspaceTaxesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    // Narrow and medium layouts collapse the columns into a card that has nowhere to put the code.
    const shouldShowTaxCodeCell = !shouldUseNarrowTableLayout && shouldShowTaxCodeColumn;

    const taxTableColumns: Array<TableColumn<WorkspaceTaxTableColumnKey, WorkspaceTaxTableRowData>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
            dynamicSizing: {
                // The cell stacks the default indicator under the name, so whichever of the two renders wider decides
                // the column's width.
                getContentToMeasure: (item) => [
                    {text: item.name, fontSize: fontScale.text},
                    {text: item.defaultLabel, fontSize: fontScale.label},
                ],
            },
        },
        {
            key: 'taxRate',
            label: translate('workspace.taxes.taxRate'),
            sortable: true,
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: item.taxRateValue, fontSize: fontScale.text}],
                // A rate is a short percentage, so the column always shows it in full.
                shouldFitContent: true,
            },
        },
        ...(shouldShowTaxCodeCell
            ? [
                  {
                      key: 'taxCode' as const,
                      label: translate('workspace.taxes.taxCode'),
                      sortable: true,
                      dynamicSizing: {
                          getContentToMeasure: (item: WorkspaceTaxTableRowData) => [{text: item.taxCode, fontSize: fontScale.text}],
                      },
                  },
              ]
            : []),
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

        // Computed after the branch above, so sorting by the switch never pays for a locale compare it discards.
        const nameComparison = localeCompare(item1.name, item2.name) * orderMultiplier;

        if (activeSorting.columnKey === 'taxRate') {
            // A rate that does not parse cannot be ordered against the ones that do, so it sorts last in both
            // directions. Comparing it equal to every rate instead would leave the comparator non-transitive.
            return compareOptionalValues(getNumericTaxRateValue(item1.taxRateValue), getNumericTaxRateValue(item2.taxRateValue), compareTaxRateValues, orderMultiplier, nameComparison);
        }

        if (activeSorting.columnKey === 'taxCode') {
            return compareOptionalValues(item1.taxCode, item2.taxCode, localeCompare, orderMultiplier, nameComparison);
        }

        return nameComparison;
    };

    // Deliberately not narrowed by layout, so resizing the window never changes which rows a query matches.
    const isItemInSearch: IsItemInSearchCallback<WorkspaceTaxTableRowData> = (item, searchValue) => {
        const searchableFields = [item.name, item.taxRateValue, item.defaultLabel, ...(shouldShowTaxCodeColumn ? [item.taxCode] : [])];
        const results = tokenizedSearch([item], searchValue, () => searchableFields);
        return results.length > 0;
    };

    const renderTaxItem = ({item, index}: ListRenderItemInfo<WorkspaceTaxTableRowData>) => (
        <WorkspaceTaxesTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            shouldShowTaxCodeColumn={shouldShowTaxCodeColumn}
        />
    );

    const searchBarComponent = <Table.FilterBar label={translate('workspace.taxes.findTaxRate')} />;
    const tableHeaderComponent = composeTableListHeader(headerComponent, searchBarComponent);

    return (
        <Table
            shouldUseDynamicColumns
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
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceTaxTableRowData, WorkspaceTaxTableColumnKey};
