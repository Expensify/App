import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
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
    isPolicyAdmin: boolean;
    shouldShowCustomField1Column: boolean;
    shouldShowCustomField2Column: boolean;
    onRowSelectionChange: (selectedRows: WorkspaceMemberRowData[]) => void;
};

export default function WorkspaceMembersTable({ref, isPolicyAdmin, shouldShowCustomField1Column, shouldShowCustomField2Column, members, onRowSelectionChange}: WorkspaceMembersTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const workspaceMembersColumns: Array<TableColumn<WorkspaceMembersTableColumnKey>> = [
        {
            key: 'member',
            label: translate('common.member'),
            sortable: true,
        },
        {
            key: 'role',
            label: translate('common.role'),
            sortable: true,
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
            label: '',
            key: 'actions',
            width: variables.tableCaretColumnWidth,
            sortable: false,
        },
    ];

    const compareTableItems: CompareItemsCallback<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'member') {
            return localeCompare(item1.name, item2.name) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'role') {
            return localeCompare(item1.role, item2.role) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'customField1') {
            const item1CustomField1Value = item1.employeeUserID ?? '';
            const item2CustomField1Value = item2.employeeUserID ?? '';
            return localeCompare(item1CustomField1Value, item2CustomField1Value) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'customField2') {
            const item1CustomField2Value = item1.employeePayrollID ?? '';
            const item2CustomField2Value = item2.employeePayrollID ?? '';
            return localeCompare(item1CustomField2Value, item2CustomField2Value) * orderMultiplier;
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
            selectionEnabled={isPolicyAdmin}
            columns={workspaceMembersColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            onRowSelectionChange={onRowSelectionChange}
        >
            {members.length > CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.people.findMember')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceMembersTableColumnKey, WorkspaceMemberRowData};
