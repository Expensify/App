import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

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

    /** Whether the tax code column is visible on web screens or not */
    shouldShowTaxCodeColumn: boolean;

    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;
};

/**
 * Sorts rate values numerically rather than as text, so "9%" comes before "10%".
 */
function compareTaxRateValues(value1: string, value2: string): number {
    const number1 = Number.parseFloat(value1);
    const number2 = Number.parseFloat(value2);

    if (Number.isNaN(number1) || Number.isNaN(number2) || number1 === number2) {
        return 0;
    }

    return number1 - number2;
}

export default function WorkspaceTaxesTable({taxes, selectionEnabled, selectedKeys, shouldShowTaxCodeColumn, onRowSelectionChange, headerComponent}: WorkspaceTaxesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

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
        ...(shouldShowTaxCodeColumn
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
            const rateComparison = compareTaxRateValues(item1.taxRateValue, item2.taxRateValue);

            if (rateComparison !== 0) {
                return rateComparison * orderMultiplier;
            }

            return nameComparison;
        }

        if (activeSorting.columnKey === 'taxCode') {
            // Rates without a code sort last in both directions, so the codes stay grouped together.
            if (!item1.taxCode && !item2.taxCode) {
                return nameComparison;
            }

            if (!item1.taxCode) {
                return 1;
            }

            if (!item2.taxCode) {
                return -1;
            }

            const codeComparison = localeCompare(item1.taxCode, item2.taxCode);

            if (codeComparison !== 0) {
                return codeComparison * orderMultiplier;
            }

            return nameComparison;
        }

        return nameComparison;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceTaxTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.alternateText, option.taxCode]);
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
