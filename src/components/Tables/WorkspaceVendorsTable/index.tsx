import Switch from '@components/Switch';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

type WorkspaceVendorTableColumnKey = 'name' | 'enabled';

type WorkspaceVendorTableRowData = TableData & {
    name: string;
    enabled: boolean;
    disabled: boolean;
    isLocked: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    onToggleEnabled: (enabled: boolean) => void;
    dismissError: () => void;
};

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
};

function WorkspaceVendorsTable({vendors, selectionEnabled = false, selectedKeys = [], onRowSelectionChange, headerComponent}: WorkspaceVendorsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const columns: Array<TableColumn<WorkspaceVendorTableColumnKey>> = [
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

    const renderVendorItem = ({item, index}: ListRenderItemInfo<WorkspaceVendorTableRowData>) => {
        const accessibilityLabel = [item.name, item.enabled ? translate('common.enabled') : translate('common.disabled')].filter(Boolean).join(', ');

        return (
            <Table.Row
                interactive={false}
                accessibilityLabel={accessibilityLabel}
                rowIndex={index}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INITIAL.VENDORS}
                disabled={item.disabled}
                offlineWithFeedback={{
                    errors: item.errors,
                    pendingAction: item.pendingAction,
                    onClose: item.dismissError,
                }}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                    <TextWithTooltip
                        shouldShowTooltip
                        numberOfLines={1}
                        text={item.name}
                    />
                </View>
                <View style={[styles.justifyContentCenter, styles.alignItemsEnd]}>
                    <Switch
                        isOn={item.enabled}
                        showLockIcon={item.isLocked}
                        disabled={item.disabled || item.isLocked}
                        accessibilityLabel={`${translate('workspace.vendors.enableVendor')}: ${item.name}`}
                        onToggle={item.onToggleEnabled}
                    />
                </View>
            </Table.Row>
        );
    };

    const tableHeaderComponent = composeTableListHeader(headerComponent, <Table.FilterBar label={translate('workspace.vendors.findVendor')} />);

    return (
        <Table
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
                subtitleText={translate('workspace.vendors.emptySubtitle')}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceVendorsTable;

export type {WorkspaceVendorTableRowData};
