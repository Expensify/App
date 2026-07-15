import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import RoomMembersTableRow from './RoomMembersTableRow';

type RoomMembersTableColumnKey = 'member' | 'actions';

type RoomMemberRowData = TableData & {
    accountID: number;
    login: string;
    name: string;
    email: string;
    disabled?: boolean;
    isSelectionDisabled?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    action: () => void;
    dismissError: () => void;
};

type RoomMembersTableProps = {
    ref?: React.Ref<TableHandle<RoomMemberRowData, RoomMembersTableColumnKey, string>>;

    /** The rows to render in the table */
    members: RoomMemberRowData[];

    /** Whether multi-selection is enabled */
    selectionEnabled: boolean;

    /** The list of selected row keys */
    selectedKeys: string[];

    /** Callback when the set of selected rows changes */
    onRowSelectionChange: (selectedRowKeys: string[]) => void;

    /** Callback when the active search string changes */
    onSearchStringChange?: (searchString: string) => void;
};

export default function RoomMembersTable({ref, members, selectionEnabled, selectedKeys, onRowSelectionChange, onSearchStringChange}: RoomMembersTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const columns: Array<TableColumn<RoomMembersTableColumnKey>> = [
        {
            key: 'member',
            label: translate('common.member'),
            sortable: false,
        },
        {
            key: 'actions',
            label: '',
            width: variables.tableCaretColumnWidth,
            sortable: false,
        },
    ];

    const compareItems: CompareItemsCallback<RoomMemberRowData, RoomMembersTableColumnKey> = (item1, item2) => localeCompare(item1.name.toLowerCase(), item2.name.toLowerCase());

    const isItemInSearch: IsItemInSearchCallback<RoomMemberRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email, option.login]);
        return results.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<RoomMemberRowData>) => (
        <RoomMembersTableRow
            item={item}
            rowIndex={index}
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
            onSearchStringChange={onSearchStringChange}
        >
            <Table.FilterBar label={translate('selectionList.findMember')} />
            <Table.Header />
            <Table.Body contentContainerStyle={styles.flexGrow1} />
        </Table>
    );
}

export type {RoomMembersTableColumnKey, RoomMemberRowData};
