import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import DomainMembersTableRow from './DomainMembersTableRow';

type DomainMembersTableColumnKey = 'member' | 'group' | 'actions';
type DomainMembersTableFilterKey = 'group';

type DomainMemberRowData = TableData & {
    accountID: number;
    login: string;
    name: string;
    email: string;
    groupName: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    dismissError: () => void;
};

type DomainMembersTableProps = {
    members: DomainMemberRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    shouldShowGroupColumn: boolean;
    filterConfig?: FilterConfig<DomainMembersTableFilterKey>;
    isItemInFilter?: IsItemInFilterCallback<DomainMemberRowData>;
    headerComponent?: React.ReactElement;
    EmptyStateComponent: React.ReactElement;
};

const ALL_MEMBERS_VALUE = 'all';

/**
 * Clears stale group filter values when the filter is hidden or the selected group disappears from Onyx.
 */
function DomainMembersGroupFilterSync({shouldShowGroupFilter, groupOptionValuesKey}: {shouldShowGroupFilter: boolean; groupOptionValuesKey: string}) {
    const {activeFilters, tableMethods} = useTableContext<DomainMemberRowData, DomainMembersTableColumnKey>();
    const groupFilterValue = activeFilters.group;

    useEffect(() => {
        const activeGroupFilter = typeof groupFilterValue === 'string' ? groupFilterValue : undefined;
        const groupOptionValues = groupOptionValuesKey ? groupOptionValuesKey.split(',') : [];

        if (!shouldShowGroupFilter) {
            if (activeGroupFilter && activeGroupFilter !== ALL_MEMBERS_VALUE) {
                tableMethods.updateFilter({key: 'group', value: ALL_MEMBERS_VALUE});
            }
            return;
        }

        if (activeGroupFilter && activeGroupFilter !== ALL_MEMBERS_VALUE && !groupOptionValues.includes(activeGroupFilter)) {
            tableMethods.updateFilter({key: 'group', value: ALL_MEMBERS_VALUE});
        }
    }, [shouldShowGroupFilter, groupOptionValuesKey, groupFilterValue, tableMethods]);

    return null;
}

export default function DomainMembersTable({
    members,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    shouldShowGroupColumn,
    filterConfig,
    isItemInFilter,
    headerComponent,
    EmptyStateComponent,
}: DomainMembersTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const shouldShowSearchBar = members.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const shouldShowGroupFilter = !!filterConfig;
    const groupOptionValuesKey = filterConfig?.group.options.map((option) => option.value).join(',') ?? '';
    const isEmpty = members.length === 0;

    const domainMembersTableColumns: Array<TableColumn<DomainMembersTableColumnKey>> = [
        {
            key: 'member',
            label: translate('domain.members.title'),
            sortable: true,
        },
        ...(shouldShowGroupColumn
            ? [
                  {
                      key: 'group' as const,
                      label: translate('common.group'),
                      sortable: true,
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

    const compareTableItems: CompareItemsCallback<DomainMemberRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'group') {
            return localeCompare(item1.groupName, item2.groupName) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainMemberRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.name, option.email]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainMemberRowData>) => (
        <DomainMembersTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            shouldShowGroupColumn={shouldShowGroupColumn}
        />
    );

    const shouldShowTableControls = !isEmpty;
    const tableHeaderComponent =
        headerComponent || (shouldShowTableControls && (shouldShowGroupFilter || shouldShowSearchBar)) ? (
            <>
                {headerComponent}
                {shouldShowTableControls && shouldShowGroupFilter && (
                    <View style={[styles.mh5, styles.mb3]}>
                        <Table.FilterButtons />
                    </View>
                )}
                {shouldShowTableControls && shouldShowSearchBar && <Table.SearchBar label={translate('domain.members.findMember')} />}
            </>
        ) : undefined;

    return (
        <Table
            data={members}
            columns={domainMembersTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="member"
            title={translate('domain.members.title')}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            filters={filterConfig}
            isItemInFilter={isItemInFilter}
            headerComponent={tableHeaderComponent}
            shouldUseStickyColumnHeader
            ListEmptyComponent={EmptyStateComponent}
        >
            {!isEmpty && (
                <DomainMembersGroupFilterSync
                    shouldShowGroupFilter={shouldShowGroupFilter}
                    groupOptionValuesKey={groupOptionValuesKey}
                />
            )}
            <Table.Body />
        </Table>
    );
}

export type {DomainMemberRowData, DomainMembersTableColumnKey, DomainMembersTableFilterKey};
