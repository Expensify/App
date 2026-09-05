import ActivityIndicator from '@components/ActivityIndicator';
import type {ActiveSorting, CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

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

    /** Callback when the active search string changes */
    onSearchStringChange?: (searchString: string) => void;

    /** Callback when scrolling to the bottom of the list */
    onEndReached?: () => void;

    /** Threshold for the end-reached callback */
    onEndReachedThreshold?: number;

    /** Callback when the active sorting configuration changes */
    onSortingChange?: (sorting: ActiveSorting<WorkspaceRoomsTableColumnKey>) => void;

    /** Content rendered above the table header inside the scrollable list */
    headerComponent?: React.ReactElement;
};

function WorkspaceRoomsTable({rooms, policyID, highlightedReportID, onSearchStringChange, onEndReached, onEndReachedThreshold, onSortingChange, headerComponent}: WorkspaceRoomsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<WorkspaceRoomRowData, WorkspaceRoomsTableColumnKey>>(null);
    const [roomsMetadata] = useOnyx(ONYXKEYS.POLICY_ROOMS_METADATA, {
        selector: (value) => value?.[policyID],
    });

    // A page beyond the first one is loading, so the rows already on screen stay and the footer reports the progress.
    const isLoadingMoreRooms = !!roomsMetadata?.isLoading && (roomsMetadata?.pageNumber ?? 1) > 1;

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
        // The room has to be looked up in the table's processed data: an active search can filter it out
        // (in which case there is nothing to scroll to and the FlashList is not even mounted), and FlashList
        // matches the scroll target by reference, so the row instance must come from the data the list renders.
        const highlightedRow = tableRef.current?.getProcessedData().find((row) => row.keyForList === highlightedRoom.keyForList);
        if (!highlightedRow) {
            return;
        }
        tableRef.current?.scrollToItem({
            item: highlightedRow,
            animated: false,
            viewPosition: 0.5,
        });
        tableRef.current?.highlightItems([highlightedRow.keyForList]);
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

    const listFooterComponent = isLoadingMoreRooms ? (
        <View style={[styles.pv3, styles.alignItemsCenter]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                extraLoadingContext={{context: 'WorkspaceRoomsTable.loadMore'}}
            />
        </View>
    ) : undefined;

    if (!roomsMetadata?.isLoaded) {
        // The page header stays visible above the loading skeleton so the layout doesn't jump once the table renders.
        return (
            <>
                {headerComponent}
                <Table.LoadingState />
            </>
        );
    }

    const tableHeaderComponent = composeTableListHeader(headerComponent, <Table.FilterBar label={translate('workspace.common.findRoom')} />);

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
            onSearchStringChange={onSearchStringChange}
            onSortingChange={onSortingChange}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListFooterComponent={listFooterComponent}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body contentContainerStyle={tableBodyContentContainerStyle} />
        </Table>
    );
}

export default WorkspaceRoomsTable;
export type {WorkspaceRoomRowData};
