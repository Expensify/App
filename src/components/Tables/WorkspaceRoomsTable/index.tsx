import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import Table from '@components/Table';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useEffect, useRef} from 'react';

import type {WorkspaceRoomRowData} from './WorkspaceRoomsTableRow';

import WorkspaceRoomsTableRow from './WorkspaceRoomsTableRow';

type WorkspaceRoomsTableColumnKey = 'name' | 'members' | 'actions';

type WorkspaceRoomsTableProps = {
    /** Pre-built row data for each room */
    rooms: WorkspaceRoomRowData[];

    /** The policyID that we are viewing the rooms of */
    policyID: string;

    /** The reportID of the room that should play the highlight animation (e.g. when it was just created) */
    highlightedReportID?: string;
};

function WorkspaceRoomsTable({rooms, policyID, highlightedReportID}: WorkspaceRoomsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey>>(null);
    const [isPolicyRoomDataLoaded] = useOnyx(ONYXKEYS.ARE_POLICY_ROOMS_LOADED, {
        selector: (value) => value?.[policyID],
    });

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: styles.pb5,
    });

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    useEffect(() => {
        if (!highlightedReportID) {
            return;
        }
        const highlightedRoom = rooms.find((room) => room.reportID === highlightedReportID);
        if (!highlightedRoom) {
            return;
        }
        tableRef.current?.scrollToItem({item: highlightedRoom, animated: false});
        tableRef.current?.highlightItems([highlightedRoom.keyForList]);
    }, [highlightedReportID, rooms]);

    const columns: Array<TableColumn<WorkspaceRoomsTableColumnKey>> = [
        {key: 'name', label: translate('common.name'), sortable: true},
        {key: 'members', label: translate('common.members'), width: variables.workspaceRoomsMembersColumnWidth, sortable: true},
        {key: 'actions', label: '', width: variables.workspaceRoomsActionsColumnWidth, styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}, sortable: false},
    ];

    const compareItems: CompareItemsCallback<WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

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

    if (!isPolicyRoomDataLoaded) {
        return <Table.LoadingState context="WorkspaceRoomsTable" />;
    }

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
            <Table.FilterBar label={translate('workspace.common.findRoom')} />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body contentContainerStyle={tableBodyContentContainerStyle} />
        </Table>
    );
}

export default WorkspaceRoomsTable;
export type {WorkspaceRoomRowData};
