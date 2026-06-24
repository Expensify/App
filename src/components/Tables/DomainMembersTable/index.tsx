import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
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
    brickRoadIndicator?: BrickRoad;
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
    EmptyStateComponent: React.ReactElement;
};

export default function DomainMembersTable({
    members,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    shouldShowGroupColumn,
    filterConfig,
    isItemInFilter,
    EmptyStateComponent,
}: DomainMembersTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const shouldShowSearchBar = members.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const shouldShowGroupFilter = !!filterConfig;
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
        >
            {isEmpty && EmptyStateComponent}
            {!isEmpty && (
                <>
                    {(shouldShowGroupFilter || shouldShowSearchBar) && (
                        <View style={[styles.mh5, styles.gap3, styles.mb5, shouldDisplayButtonsInSeparateLine ? styles.flexColumn : styles.flexRow]}>
                            {shouldShowGroupFilter && (
                                <View
                                    style={[
                                        shouldDisplayButtonsInSeparateLine && styles.w100,
                                        shouldShowSearchBar && !shouldDisplayButtonsInSeparateLine && styles.h13,
                                        shouldShowSearchBar && !shouldDisplayButtonsInSeparateLine && styles.justifyContentCenter,
                                    ]}
                                >
                                    <Table.FilterButtons />
                                </View>
                            )}
                            {shouldShowSearchBar && (
                                <View style={[shouldDisplayButtonsInSeparateLine ? styles.w100 : styles.flex1]}>
                                    <Table.SearchBar
                                        label={translate('domain.members.findMember')}
                                        style={[styles.flex1, styles.mh0, styles.mb0]}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export type {DomainMemberRowData, DomainMembersTableColumnKey, DomainMembersTableFilterKey};
