import React from 'react';
import {TableHandle} from '@components/Table';

type WorkspaceMembersTableColumnKey = 'member' | 'role' | 'actions';

type WorkspaceMemberRowData = {
    keyForList: string;
};

type WorkspaceMembersTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string>> | undefined;
    members: WorkspaceMemberRowData[];
};

export default function WorkspaceMembersTable({}: WorkspaceMembersTableProps) {
    return <></>;
}

export type {WorkspaceMembersTableColumnKey, WorkspaceMemberRowData};
