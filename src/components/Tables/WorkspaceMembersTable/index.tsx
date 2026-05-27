import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceMembersTableRow from './WorkspaceMembersTableRow';

type WorkspaceMembersTableColumnKey = 'member' | 'role' | 'actions' | 'customField1' | 'customField2';

type WorkspaceMemberRowData = TableData & {
    accountID: number;
    login: string;
    role: string;
    employeeUserID?: string;
    employeePayrollID?: string;
    isSelectionDisabled: boolean;
    isInteractive: boolean;
    name: string;
    email: string;
    shouldShowEmployeeUserID: boolean;
    shouldShowEmployeePayrollID: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    invitedSecondaryLogin: string;
    action: () => void;
    dismissError: () => void;
};

type WorkspaceMembersTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string>> | undefined;
    members: WorkspaceMemberRowData[];
    shouldShowCustomField1Column: boolean;
    shouldShowCustomField2Column: boolean;
};

export default function WorkspaceMembersTable({ref, shouldShowCustomField1Column, shouldShowCustomField2Column, members}: WorkspaceMembersTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const workspaceMembersColumns: Array<TableColumn<WorkspaceMembersTableColumnKey>> = [
        {
            sortable: true,
            key: 'member',
            label: translate('common.members'),
        },
        {
            sortable: true,
            key: 'role',
            label: translate('common.role'),
        },
        ...(shouldShowCustomField1Column
            ? [
                  {
                      sortable: true,
                      key: 'customField1' as const,
                      label: translate('workspace.common.customField1'),
                  },
              ]
            : []),
        ...(shouldShowCustomField2Column
            ? [
                  {
                      sortable: true,
                      key: 'customField2' as const,
                      label: translate('workspace.common.customField2'),
                  },
              ]
            : []),
        {
            sortable: false,
            key: 'actions',
            label: '',
        },
    ];

    const compareTableItems: CompareItemsCallback<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'member') {
        }

        if (activeSorting.columnKey === 'role') {
        }

        if (activeSorting.columnKey === 'customField1') {
        }

        if (activeSorting.columnKey === 'customField2') {
        }

        return 1;
    };

    const isTableItemInSearch: IsItemInSearchCallback<WorkspaceMemberRowData> = (item, searchValue) => {
        return false;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<WorkspaceMemberRowData>) => {
        return (
            <WorkspaceMembersTableRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
                shouldShowCustomField1Column={shouldShowCustomField1Column}
                shouldShowCustomField2Column={shouldShowCustomField2Column}
            />
        );
    };

    return (
        <Table
            ref={ref}
            data={members}
            columns={workspaceMembersColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
        >
            {members.length > CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.people.findMember')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceMembersTableColumnKey, WorkspaceMemberRowData};
