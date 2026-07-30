import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import WorkspaceReportFieldListValuesTableRow from './WorkspaceReportFieldListValuesTableRow';

type ReportFieldListValueColumnKey = 'name' | 'enabled' | 'actions';

type ReportFieldListValueRowData = TableData & {
    value: string;
    name: string;
    index: number;
    enabled: boolean;
    isLocked: boolean;
    isSwitchDisabled?: boolean;
    action: () => void;
    onToggleEnabled: (enabled: boolean) => void;
    onDisabledSwitchPress?: () => void;
};

type WorkspaceReportFieldListValuesTableProps = {
    listValues: ReportFieldListValueRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function WorkspaceReportFieldListValuesTable({listValues, selectionEnabled, selectedKeys, onRowSelectionChange}: WorkspaceReportFieldListValuesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapers']);

    const columns: Array<TableColumn<ReportFieldListValueColumnKey>> = [
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

    const compareItems: CompareItemsCallback<ReportFieldListValueRowData, ReportFieldListValueColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'enabled') {
            const enabled1 = item1.enabled ? 1 : 0;
            const enabled2 = item2.enabled ? 1 : 0;
            return (enabled1 - enabled2) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<ReportFieldListValueRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.value]);
        return results.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<ReportFieldListValueRowData>) => (
        <WorkspaceReportFieldListValuesTableRow
            item={item}
            rowIndex={index}
        />
    );

    return (
        <Table
            data={listValues}
            columns={columns}
            selectionEnabled={selectionEnabled}
            shouldEnableSelectionInNarrowPaneModal
            selectedKeys={selectedKeys}
            initialSortColumn="name"
            title={translate('workspace.reportFields.listValues')}
            renderItem={renderItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            keyExtractor={(item) => item.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            <Table.FilterBar label={translate('workspace.reportFields.findReportField')} />
            <Table.EmptyState
                title={translate('workspace.reportFields.emptyReportFieldsValues.title')}
                subtitle={translate('workspace.reportFields.emptyReportFieldsValues.subtitle')}
                headerMedia={illustrations.FolderWithPapers}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.emptyStateFolderWithPaperIconSize}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {ReportFieldListValueColumnKey, ReportFieldListValueRowData};
