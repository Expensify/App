import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';

import useLocalize from '@hooks/useLocalize';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import ReportParticipantsTableRow from './ReportParticipantsTableRow';

type ReportParticipantsTableColumnKey = 'member' | 'role' | 'actions';

type ReportParticipantRowData = TableData & {
    /** The accountID of the participant */
    accountID: number;

    /** The participant's login (email/phone) */
    login: string;

    /** The participant's display name */
    name: string;

    /** The participant's formatted email/phone shown as the subtitle */
    email: string;

    /** Whether the participant is an admin of the group chat */
    isAdmin: boolean;

    /** Whether the participant list belongs to a group chat (drives the role column & selection) */
    isGroupChat: boolean;

    /** The pending action for the row, used for offline feedback */
    pendingAction?: OnyxCommon.PendingAction;

    /** Callback invoked when the row is pressed (outside of selection mode) */
    action: () => void;
};

type ReportParticipantsTableProps = {
    ref?: React.Ref<TableHandle<ReportParticipantRowData, ReportParticipantsTableColumnKey, string>>;

    /** The rows to render in the table */
    members: ReportParticipantRowData[];

    /** Whether the participant list belongs to a group chat */
    isGroupChat: boolean;

    /** Whether multi-selection is enabled */
    selectionEnabled: boolean;

    /** The list of selected row keys */
    selectedKeys: string[];

    /** Whether to show the find-member search bar */
    shouldShowSearchBar: boolean;

    /** Callback when the set of selected rows changes */
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function ReportParticipantsTable({ref, members, isGroupChat, selectionEnabled, selectedKeys, shouldShowSearchBar, onRowSelectionChange}: ReportParticipantsTableProps) {
    const {translate, localeCompare} = useLocalize();

    const columns: Array<TableColumn<ReportParticipantsTableColumnKey>> = [
        {
            key: 'member',
            label: translate('common.member'),
            sortable: false,
        },
        ...(isGroupChat
            ? [
                  {
                      key: 'role' as const,
                      label: translate('common.role'),
                      sortable: false,
                      width: variables.workspaceMembersRoleColumnWidth,
                  },
              ]
            : []),
        {
            key: 'actions',
            label: '',
            width: variables.tableCaretColumnWidth,
            sortable: false,
        },
    ];

    const compareItems: CompareItemsCallback<ReportParticipantRowData, ReportParticipantsTableColumnKey> = (item1, item2) =>
        localeCompare(item1.name.toLowerCase(), item2.name.toLowerCase());

    const isItemInSearch: IsItemInSearchCallback<ReportParticipantRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email, option.login]);
        return results.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<ReportParticipantRowData>) => (
        <ReportParticipantsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout
        />
    );

    return (
        <Table
            ref={ref}
            data={members}
            columns={columns}
            selectedKeys={selectedKeys}
            selectionEnabled={selectionEnabled}
            shouldEnableSelectionInNarrowPaneModal
            initialSortColumn="member"
            title={translate('common.members')}
            renderItem={renderItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            keyExtractor={(item) => item.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            {shouldShowSearchBar && <Table.SearchBar label={translate('selectionList.findMember')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {ReportParticipantsTableColumnKey, ReportParticipantRowData};
