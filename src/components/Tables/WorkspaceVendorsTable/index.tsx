import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

type WorkspaceVendorTableColumnKey = 'name';

type WorkspaceVendorTableRowData = TableData & {
    name: string;
};

type WorkspaceVendorsTableProps = {
    vendors: WorkspaceVendorTableRowData[];
};

function WorkspaceVendorsTable({vendors}: WorkspaceVendorsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const columns: Array<TableColumn<WorkspaceVendorTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceVendorTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceVendorTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue.toLowerCase(), (option) => [option.name]);
        return results.length > 0;
    };

    const renderVendorItem = ({item, index}: ListRenderItemInfo<WorkspaceVendorTableRowData>) => (
        <Table.Row
            interactive={false}
            rowIndex={index}
            accessibilityLabel={item.name}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INITIAL.VENDORS}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <TextWithTooltip
                    shouldShowTooltip
                    numberOfLines={1}
                    text={item.name}
                />
            </View>
        </Table.Row>
    );

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
        >
            <Table.FilterBar label={translate('workspace.vendors.findVendor')} />
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
