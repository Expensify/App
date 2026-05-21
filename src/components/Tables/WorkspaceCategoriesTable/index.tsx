import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table/';
import Table from '@components/Table/';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceCategoriesTableRow from './WorkspaceCategoriesTableRow';

type WorkspaceCategoryTableColumnKey = 'name' | 'glCode' | 'approver' | 'enabled' | 'actions';

type WorkspaceCategoryTableRowData = TableData & {
    name: string;
    glCode?: string;
    enabled: boolean;
    approverAvatar?: AvatarSource;
    approverAccountID?: number;
    approverDisplayName?: string;
    isDisabled: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    dismissError: () => void;
    onToggleEnabled: (enabled: boolean) => void;
};

type WorkspaceCategoriesTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceCategoryTableRowData, WorkspaceCategoryTableColumnKey, string>> | undefined;
    categories: WorkspaceCategoryTableRowData[];
    shouldShowApproverColumn: boolean;
    onRowSelectionChange: (selectedRows: WorkspaceCategoryTableRowData[]) => void;
};

export default function WorkspaceCategoriesTable({ref, categories, shouldShowApproverColumn, onRowSelectionChange}: WorkspaceCategoriesTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const categoryTableColumns: Array<TableColumn<WorkspaceCategoryTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
        {
            key: 'glCode',
            label: translate('workspace.categories.glCode'),
            sortable: true,
        },
        ...(shouldShowApproverColumn
            ? [
                  {
                      key: 'approver' as const,
                      label: translate('common.approver'),
                      sortable: true,
                  },
              ]
            : []),
        {
            key: 'enabled',
            label: translate('common.enabled'),
            sortable: true,
            width: 64,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: 52,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceCategoryTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'approver') {
            const approver1 = item1.approverDisplayName ?? '';
            const approver2 = item2.approverDisplayName ?? '';
            return localeCompare(approver1, approver2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'enabled') {
            if (item1.enabled === item2.enabled) {
                return 0;
            }

            return (item1.enabled ? -1 : 1) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCategoryTableRowData> = (item, searchValue) => {
        const searchLower = searchValue.toLowerCase();
        return !!item.name.toLowerCase().includes(searchLower) || !!item.glCode?.toLowerCase().includes(searchLower);
    };

    const renderCategoryItem = ({item, index}: ListRenderItemInfo<WorkspaceCategoryTableRowData>) => (
        <WorkspaceCategoriesTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowLayout || isMediumScreenWidth}
            shouldShowApproverColumn={shouldShowApproverColumn}
        />
    );

    return (
        <Table
            ref={ref}
            selectionEnabled
            data={categories}
            title={translate('workspace.common.categories')}
            columns={categoryTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderCategoryItem}
            onRowSelectionChange={onRowSelectionChange}
        >
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {WorkspaceCategoryTableRowData, WorkspaceCategoryTableColumnKey};
