import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import WorkspaceRoomsTableRow from './WorkspaceRoomsTableRow';
import type {WorkspaceRoomRowData} from './WorkspaceRoomsTableRow';

type WorkspaceRoomsTableColumnKey = 'name' | 'createdBy' | 'members' | 'actions';

type WorkspaceRoomsTableProps = {
    /** Pre-built row data for each room */
    rooms: WorkspaceRoomRowData[];
};

function WorkspaceRoomsTable({rooms}: WorkspaceRoomsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<WorkspaceRoomsTableColumnKey>> = [
        {key: 'name', label: translate('common.name')},
        {key: 'createdBy', label: translate('common.createdBy')},
        {key: 'members', label: translate('common.members'), width: variables.workspaceRoomsMembersColumnWidth},
        {key: 'actions', label: '', width: variables.workspaceRoomsActionsColumnWidth, styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}},
    ];

    const compareItems: CompareItemsCallback<WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'createdBy') {
            return orderMultiplier * localeCompare(a.ownerDisplayName, b.ownerDisplayName);
        }

        if (activeSorting.columnKey === 'members') {
            return orderMultiplier * (a.memberCount - b.memberCount);
        }

        return orderMultiplier * localeCompare(a.name, b.name);
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceRoomRowData> = (item, searchValue) => item.name.toLowerCase().includes(searchValue.toLowerCase());

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceRoomRowData>) => (
        <WorkspaceRoomsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={rooms}
            columns={columns}
            renderItem={renderItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="name"
            title={translate('workspace.common.rooms')}
            keyExtractor={(row) => row.reportID}
        >
            <View style={[styles.searchBarMargin, styles.searchBarWidth(shouldUseNarrowTableLayout)]}>
                <Table.SearchBar label={translate('workspace.common.findRoom')} />
            </View>
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceRoomsTable;
export type {WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey};
