import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {PropsWithChildren} from 'react';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import WorkspaceTagsTableRow from './WorkspaceTagsTableRow';
import type {WorkspaceTagTableRowData} from './WorkspaceTagsTableRow';

type WorkspaceTagTableColumnKey = 'name' | 'glCode' | 'approver' | 'tagCount' | 'enabled' | 'required' | 'actions';

type WorkspaceTagsTableProps = PropsWithChildren<{
    tags: WorkspaceTagTableRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    isMultiLevelTags: boolean;
    hasDependentTags: boolean;
    shouldShowGLCodeColumn: boolean;
    shouldShowApproverColumn: boolean;
}>;

export default function WorkspaceTagsTable({
    tags,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    isMultiLevelTags,
    hasDependentTags,
    shouldShowGLCodeColumn,
    shouldShowApproverColumn,
    children,
}: WorkspaceTagsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const shouldShowTagCountColumn = hasDependentTags && !shouldUseNarrowTableLayout;
    const shouldShowEnabledColumn = !isMultiLevelTags;
    const shouldShowRequiredColumn = isMultiLevelTags && !hasDependentTags;

    const tagTableColumns: Array<TableColumn<WorkspaceTagTableColumnKey>> = [
        {
            key: 'name',
            label: translate('common.name'),
            sortable: true,
        },
        ...(shouldShowGLCodeColumn
            ? [
                  {
                      key: 'glCode' as const,
                      label: translate('workspace.tags.glCode'),
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
        ...(shouldShowTagCountColumn
            ? [
                  {
                      key: 'tagCount' as const,
                      label: translate('common.count'),
                      sortable: true,
                  },
              ]
            : []),
        ...(shouldShowEnabledColumn
            ? [
                  {
                      key: 'enabled' as const,
                      label: translate('common.enabled'),
                      sortable: true,
                      width: variables.tableSwitchColumnWidth,
                      styling: {
                          containerStyles: [styles.justifyContentEnd],
                      },
                  },
              ]
            : []),
        ...(shouldShowRequiredColumn
            ? [
                  {
                      key: 'required' as const,
                      label: translate('common.required'),
                      sortable: true,
                      width: variables.tableSwitchColumnWidth,
                      styling: {
                          containerStyles: [styles.justifyContentEnd],
                      },
                  },
              ]
            : []),
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceTagTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'tagCount') {
            return ((item1.tagCount ?? 0) - (item2.tagCount ?? 0)) * orderMultiplier;
        }

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

        if (activeSorting.columnKey === 'required') {
            const required1 = item1.required ? 1 : 0;
            const required2 = item2.required ? 1 : 0;
            return (required1 - required2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'glCode') {
            const glCode1 = item1.glCode ?? '';
            const glCode2 = item2.glCode ?? '';
            return localeCompare(glCode1, glCode2) * orderMultiplier;
        }

        if (hasDependentTags || isMultiLevelTags) {
            return ((item1.orderWeight ?? 0) - (item2.orderWeight ?? 0)) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceTagTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.value]);
        return results.length > 0;
    };

    const renderTagItem = ({item, index}: ListRenderItemInfo<WorkspaceTagTableRowData>) => (
        <WorkspaceTagsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            shouldShowGLCodeColumn={shouldShowGLCodeColumn}
            shouldShowApproverColumn={shouldShowApproverColumn}
            shouldShowTagCountColumn={shouldShowTagCountColumn}
        />
    );

    const isEmpty = tags.length === 0;

    return (
        <Table
            data={tags}
            initialSortColumn="name"
            selectionEnabled={selectionEnabled}
            title={translate('workspace.common.tags')}
            columns={tagTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderTagItem}
            selectedKeys={selectedKeys}
            keyExtractor={(tag) => tag.keyForList}
            onRowSelectionChange={onRowSelectionChange}
        >
            {isEmpty && children}
            {!isEmpty && (
                <>
                    {tags.length >= CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.tags.findTag')} />}
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export type {WorkspaceTagTableRowData, WorkspaceTagTableColumnKey};
