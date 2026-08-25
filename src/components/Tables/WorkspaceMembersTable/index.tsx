import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {getPolicyApproverLogins, isControlPolicy, isSubmitPolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

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
    canSelectMembers: boolean;
    selectedKeys: string[];
    shouldShowCustomField1Column: boolean;
    shouldShowCustomField2Column: boolean;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;
};

/** Width the member cell's avatar and the space after it take before the name and email start. */
const MEMBER_CELL_AVATAR_WIDTH = variables.avatarSizeSmall + 12;

const WORKSPACE_MEMBER_FILTER_VALUES = {
    ADMINS: 'admins',
    APPROVERS: 'approvers',
    AUDITORS: 'auditors',
    CARD_ADMINS: 'cardAdmins',
    EDITORS: 'editors',
    MEMBERS: 'members',
    PAYMENTS_ADMINS: 'paymentsAdmins',
    PEOPLE_ADMINS: 'peopleAdmins',
} as const;

export default function WorkspaceMembersTable({
    ref,
    canSelectMembers,
    policy,
    selectedKeys,
    shouldShowCustomField1Column,
    shouldShowCustomField2Column,
    members,
    onRowSelectionChange,
    headerComponent,
}: WorkspaceMembersTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const workspaceMembersColumns: Array<TableColumn<WorkspaceMembersTableColumnKey, WorkspaceMemberRowData>> = [
        {
            key: 'member',
            label: translate('common.member'),
            sortable: true,
            dynamicSizing: {
                // The cell stacks the member's name above their email, so whichever of the two renders wider decides the
                // column's width.
                getContentToMeasure: (item) => [
                    {text: item.name, fontSize: variables.fontSizeNormal},
                    {text: item.email, fontSize: variables.fontSizeLabel},
                ],
                extraWidth: MEMBER_CELL_AVATAR_WIDTH,
            },
        },

        ...(shouldShowCustomField1Column
            ? [
                  {
                      sortable: true,
                      key: 'customField1' as const,
                      label: translate('workspace.common.customField1'),
                      dynamicSizing: {
                          getContentToMeasure: (item: WorkspaceMemberRowData) => (item.employeeUserID ? [{text: item.employeeUserID, fontSize: variables.fontSizeNormal}] : []),
                      },
                  },
              ]
            : []),
        ...(shouldShowCustomField2Column
            ? [
                  {
                      sortable: true,
                      key: 'customField2' as const,
                      label: translate('workspace.common.customField2'),
                      dynamicSizing: {
                          getContentToMeasure: (item: WorkspaceMemberRowData) => (item.employeePayrollID ? [{text: item.employeePayrollID, fontSize: variables.fontSizeNormal}] : []),
                      },
                  },
              ]
            : []),
        {
            key: 'role',
            label: translate('common.role'),
            sortable: true,
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: translate('workspace.common.roleName', item.role), fontSize: variables.fontSizeNormal}],
                // A role is one of a short, known set of labels, so the column always shows them in full.
                shouldFitContent: true,
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
        const memberNameComparison = localeCompare(item1.name, item2.name) * orderMultiplier;

        if (activeSorting.columnKey === 'member') {
            return memberNameComparison;
        }

        if (activeSorting.columnKey === 'role') {
            if (!item1.role && !item2.role) {
                return memberNameComparison;
            }

            if (!item1.role) {
                return 1;
            }

            if (!item2.role) {
                return -1;
            }

            const roleComparison = localeCompare(translate('workspace.common.roleName', item1.role), translate('workspace.common.roleName', item2.role));

            if (roleComparison !== 0) {
                return roleComparison * orderMultiplier;
            }

            return memberNameComparison;
        }

        if (activeSorting.columnKey === 'customField1') {
            const item1CustomField1Value = item1.employeeUserID;
            const item2CustomField1Value = item2.employeeUserID;

            if (!item1CustomField1Value && !item2CustomField1Value) {
                return memberNameComparison;
            }

            if (!item1CustomField1Value) {
                return 1;
            }

            if (!item2CustomField1Value) {
                return -1;
            }

            const employeeIdComparison = localeCompare(item1CustomField1Value, item2CustomField1Value);

            if (employeeIdComparison !== 0) {
                return employeeIdComparison * orderMultiplier;
            }

            return memberNameComparison;
        }

        if (activeSorting.columnKey === 'customField2') {
            const item1CustomField2Value = item1.employeePayrollID;
            const item2CustomField2Value = item2.employeePayrollID;

            if (!item1CustomField2Value && !item2CustomField2Value) {
                return memberNameComparison;
            }

            if (!item1CustomField2Value) {
                return 1;
            }

            if (!item2CustomField2Value) {
                return -1;
            }

            const payrollIdComparison = localeCompare(item1CustomField2Value, item2CustomField2Value);

            if (payrollIdComparison !== 0) {
                return payrollIdComparison * orderMultiplier;
            }

            return memberNameComparison;
        }

        return 1;
    };

    const isTableItemInSearch: IsItemInSearchCallback<WorkspaceMemberRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email, option.login]);
        return results.length > 0;
    };

    const approverLogins = getPolicyApproverLogins(policy);

    const isItemInFilter: IsItemInFilterCallback<WorkspaceMemberRowData> = (item, filterValues) => {
        if (!filterValues || filterValues.length === 0) {
            return true;
        }

        const isAdmin = item.role === CONST.POLICY.ROLE.ADMIN || item.role === CONST.POLICY.ROLE.OWNER;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.ADMINS) && isAdmin) {
            return true;
        }

        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS) && approverLogins.has(item.login)) {
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

        const isPeopleAdmin = item.role === CONST.POLICY.ROLE.PEOPLE_ADMIN;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.PEOPLE_ADMINS) && isPeopleAdmin) {
            return true;
        }

        const isPaymentsAdmin = item.role === CONST.POLICY.ROLE.PAYMENTS_ADMIN;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.PAYMENTS_ADMINS) && isPaymentsAdmin) {
            return true;
        }

        const isEditor = item.role === CONST.POLICY.ROLE.EDITOR;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.EDITORS) && isEditor) {
            return true;
        }

        const isMember = item.role === CONST.POLICY.ROLE.USER;
        if (filterValues.includes(WORKSPACE_MEMBER_FILTER_VALUES.MEMBERS) && isMember) {
            return true;
        }

        return false;
    };

    const filterConfig: FilterConfig = {
        role: {
            label: translate('common.role'),
            filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
            options: [
                {
                    label: translate('workspace.people.admins'),
                    value: WORKSPACE_MEMBER_FILTER_VALUES.ADMINS,
                },
                {
                    label: translate('workspace.people.approvers'),
                    value: WORKSPACE_MEMBER_FILTER_VALUES.APPROVERS,
                },
            ],
        },
    };

    if (isControlPolicy(policy)) {
        filterConfig.role.options.push({
            label: translate('workspace.people.cardAdmins'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.CARD_ADMINS,
        });

        filterConfig.role.options.push({
            label: translate('workspace.people.peopleAdmins'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.PEOPLE_ADMINS,
        });

        filterConfig.role.options.push({
            label: translate('workspace.people.paymentsAdmins'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.PAYMENTS_ADMINS,
        });

        filterConfig.role.options.push({
            label: translate('workspace.people.auditors'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.AUDITORS,
        });
    }

    if (isSubmitPolicy(policy)) {
        filterConfig.role.options.push({
            label: translate('workspace.people.editors'),
            value: WORKSPACE_MEMBER_FILTER_VALUES.EDITORS,
        });
    }

    filterConfig.role.options.push({
        label: translate('workspace.people.members'),
        value: WORKSPACE_MEMBER_FILTER_VALUES.MEMBERS,
    });

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
    const tableHeaderComponent = composeTableListHeader(headerComponent, <Table.FilterBar label={translate('workspace.people.findMember')} />);

    return (
        <Table
            shouldUseDynamicColumns
            ref={ref}
            data={members}
            filters={filterConfig}
            selectedKeys={selectedKeys}
            selectionEnabled={canSelectMembers}
            shouldPreserveSelectionOnSearch
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
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceMembersTableColumnKey, WorkspaceMemberRowData};
