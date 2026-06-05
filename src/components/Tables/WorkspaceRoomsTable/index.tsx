import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef} from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
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

    /** The reportID of the room that should play the highlight animation (e.g. when it was just created) */
    highlightedReportID?: string;
};

function WorkspaceRoomsTable({rooms, highlightedReportID}: WorkspaceRoomsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const tableRef = useRef<TableHandle<WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey>>(null);

    useEffect(() => {
        if (!highlightedReportID) {
            return;
        }
        const highlightedRoom = rooms.find((room) => room.reportID === highlightedReportID);
        if (!highlightedRoom) {
            return;
        }
        tableRef.current?.scrollToItem({item: highlightedRoom, animated: false});
    }, [highlightedReportID, rooms]);

    const columns: Array<TableColumn<WorkspaceRoomsTableColumnKey>> = [
        {key: 'name', label: translate('common.name'), sortable: true},
        {key: 'createdBy', label: translate('common.createdBy'), sortable: true},
        {key: 'members', label: translate('common.members'), width: variables.workspaceRoomsMembersColumnWidth, sortable: true},
        {key: 'actions', label: '', width: variables.workspaceRoomsActionsColumnWidth, styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}, sortable: false},
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
            shouldAnimateInHighlight={!!highlightedReportID && item.reportID === highlightedReportID}
        />
    );

    return (
        <Table
            ref={tableRef}
            data={rooms}
            columns={columns}
            renderItem={renderItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="name"
            title={translate('workspace.common.rooms')}
            keyExtractor={(row, index) => `${row.reportID}-${index}`}
        >
            <Table.SearchBar label={translate('workspace.common.findRoom')} />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceRoomsTable;
export type {WorkspaceRoomRowData};
