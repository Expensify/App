import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isControlPolicy, isPolicyApprover, isSubmitPolicy} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceMembersTableRow from './WorkspaceMembersTableRow';

type WorkspaceMembersTableColumnKey = 'member' | 'role' | 'actions' | 'customField1' | 'customField2';

type WorkspaceMemberRowData = TableData & {
    accountID: number;
    login: string;
    role?: string;
    employeeUserID?: string;
    employeePayrollID?: string;
    name: string;
    email: string;
    shouldShowEmployeeUserID: boolean;
    shouldShowEmployeePayrollID: boolean;
    shouldAnimateInHighlight?: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    invitedSecondaryLogin: string;
    action: () => void;
    dismissError: () => void;
};

type WorkspaceMembersTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string>> | undefined;
    members: WorkspaceMemberRowData[];
    policy: OnyxEntry<Policy>;
    isPolicyAdmin: boolean;
    selectedKeys: string[];
    shouldShowCustomField1Column: boolean;
    shouldShowCustomField2Column: boolean;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

const WORKSPACE_MEMBER_FILTER_VALUES = {
    ALL: 'all',
    ADMINS: 'admins',
    APPROVERS: 'approvers',
    AUDITORS: 'auditors',
    CARD_ADMINS: 'cardAdmins',
    EDITORS: 'editors',
} as const;

export default function WorkspaceMembersTable({
    ref,
    isPolicyAdmin,
    policy,
    selectedKeys,
    shouldShowCustomField1Column,
    shouldShowCustomField2Column,
    members,
    onRowSelectionChange,
}: WorkspaceMembersTableProps) {
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
            key: 'role',
            label: translate('common.role'),
            sortable: true,
            width: variables.workspaceMembersRoleColumnWidth,
            styling: {
                containerStyles: styles.justifyContentCenter,
            },
        },
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
            if (!item1.role) {
                return 1;
            }
            if (!item2.role) {
                return -1;
            }
            return localeCompare(item1.role, item2.role) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'customField1') {
            const item1CustomField1Value = item1.employeeUserID;
            const item2CustomField1Value = item2.employeeUserID;
            if (!item1CustomField1Value) {
                return 1;
            }
            if (!item2CustomField1Value) {
                return -1;
            }
            return localeCompare(item1CustomField1Value, item2CustomField1Value) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'customField2') {
            const item1CustomField2Value = item1.employeePayrollID;
            const item2CustomField2Value = item2.employeePayrollID;
            if (!item1CustomField2Value) {
                return 1;
            }
            if (!item2CustomField2Value) {
                return -1;
            }
            return localeCompare(item1CustomField2Value, item2CustomField2Value) * orderMultiplier;
        }

        return 1;
    };

    const isTableItemInSearch: IsItemInSearchCallback<WorkspaceMemberRowData> = (item, searchValue) => {
        return [item.name, item.email, item.login].some((field) => field.toLowerCase().includes(searchValue.toLowerCase()));
    };

    const isItemInFilter: IsItemInFilterCallback<WorkspaceMemberRowData> = (item, filterValues) => {
        if (!filterValues || filterValues.length === 0) {
            return true;
        }

        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.ALL)) {
            return true;
        }

        const isAdmin = item.role === CONST.POLICY.ROLE.ADMIN || item.role === CONST.POLICY.ROLE.OWNER;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.ADMINS) && isAdmin) {
            return true;
        }

        const isApprover = isPolicyApprover(policy, item.login);
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS) && isApprover) {
            return true;
        }

        const isAuditor = item.role === CONST.POLICY.ROLE.AUDITOR;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.AUDITORS) && isAuditor) {
            return true;
        }

        const isCardAdmin = item.role === CONST.POLICY.ROLE.CARD_ADMIN;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.CARD_ADMINS) && isCardAdmin) {
            return true;
        }

        return false;
    };

    const filterConfig: FilterConfig = {
        status: {
            filterType: 'single-select',
            default: WORKSPACE_MEMBER_FILTER_VALUES.ALL,
            options: [
                {label: translate('workspace.people.allMembers'), value: WORKSPACE_MEMBER_FILTER_VALUES.ALL},
                {label: translate('workspace.people.admins'), value: WORKSPACE_MEMBER_FILTER_VALUES.ADMINS},
                {label: translate('workspace.people.approvers'), value: WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS},
            ],
        },
    };

    if (isControlPolicy(policy)) {
        filterConfig.status.options.push({
            label: translate('workspace.people.cardAdmins'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.CARD_ADMINS,
        });

        filterConfig.status.options.push({
            label: translate('workspace.people.auditors'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.AUDITORS,
        });
    }

    if (isSubmitPolicy(policy)) {
        filterConfig.status.options.push({
            label: translate('workspace.people.editors'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.EDITORS,
        });
    }

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
            filters={filterConfig}
            selectedKeys={selectedKeys}
            selectionEnabled={isPolicyAdmin}
            columns={workspaceMembersColumns}
            initialSortColumn="member"
            title={translate('common.members')}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInFilter={isItemInFilter}
            isItemInSearch={isTableItemInSearch}
            keyExtractor={(item) => item.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.mb5, styles.mh5]}>
                <Table.FilterButtons />
                {members.length > CONST.STANDARD_LIST_ITEM_LIMIT && (
                    <Table.SearchBar
                        label={translate('workspace.people.findMember')}
                        style={[styles.mb0, styles.mh0]}
                    />
                )}
            </View>

            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceMembersTableColumnKey, WorkspaceMemberRowData};
