import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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
    disabled: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    isLocked: boolean;
    action: () => void;
    dismissError: () => void;
    onToggleEnabled: (enabled: boolean) => void;
};

type WorkspaceCategoriesTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceCategoryTableRowData, WorkspaceCategoryTableColumnKey, string>> | undefined;
    categories: WorkspaceCategoryTableRowData[];
    selectionEnabled: boolean;
    shouldShowGLCodeColumn: boolean;
    shouldShowApproverColumn: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    EmptyStateComponent: React.ReactElement;
};

export default function WorkspaceCategoriesTable({
    ref,
    categories,
    selectedKeys,
    selectionEnabled,
    shouldShowGLCodeColumn,
    shouldShowApproverColumn,
    onRowSelectionChange,
    EmptyStateComponent,
}: WorkspaceCategoriesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const categoryTableColumns: Array<TableColumn<WorkspaceCategoryTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
        ...(shouldShowGLCodeColumn
            ? [
                  {
                      key: 'glCode' as const,
                      label: translate('workspace.categories.glCode'),
                      sortable: true,
                  },
              ]
            : []),
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
            width: variables.tableSwitchColumnWidth,
            styling: {
                containerStyles: [styles.justifyContentEnd],
            },
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
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
            const enabled1 = item1.enabled ? 1 : 0;
            const enabled2 = item2.enabled ? 1 : 0;
            return (enabled1 - enabled2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'glCode') {
            const glCode1 = item1.glCode ?? '';
            const glCode2 = item2.glCode ?? '';
            return localeCompare(glCode1, glCode2) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCategoryTableRowData> = (item, searchValue) => {
        const searchLower = searchValue.toLowerCase();
        const results = tokenizedSearch([item], searchLower, (option) => [option.name, option.glCode ?? '']);
        return results.length > 0;
    };

    const renderCategoryItem = ({item, index}: ListRenderItemInfo<WorkspaceCategoryTableRowData>) => (
        <WorkspaceCategoriesTableRow
            item={item}
            rowIndex={index}
            shouldShowGLCodeColumn={shouldShowGLCodeColumn}
            shouldShowApproverColumn={shouldShowApproverColumn}
            shouldUseNarrowTableLayout={shouldUseNarrowLayout || isMediumScreenWidth}
        />
    );

    const isEmpty = categories.length === 0;

    return (
        <Table
            ref={ref}
            data={categories}
            initialSortColumn="name"
            selectionEnabled={selectionEnabled}
            title={translate('workspace.common.categories')}
            columns={categoryTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderCategoryItem}
            selectedKeys={selectedKeys}
            keyExtractor={(category) => category.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            {isEmpty && EmptyStateComponent}
            {!isEmpty && (
                <>
                    {categories.length >= CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.categories.findCategory')} />}
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export type {WorkspaceCategoryTableRowData, WorkspaceCategoryTableColumnKey};
