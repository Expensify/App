import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {ValueOf} from 'type-fest';
import {PopoverMenuItem} from '@components/PopoverMenu';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {AvatarSource} from '@libs/UserUtils';
import WorkspacesEmptyStateComponent from '@pages/workspace/WorkspacesEmptyStateComponent';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceRow from './WorkspaceTableRow';

export type WorkspaceTableColumnKey = 'workspaces' | 'owner' | 'type' | 'actions';

export type WorkspaceRowData = {
    rowType: 'workspace';
    title: string;
    icon: AvatarSource;
    disabled: boolean;
    isDefault: boolean;
    isDeleted: boolean;
    isJoinRequestPending: boolean;
    policyID: string;
    ownerAccountID?: number;
    ownerName?: string;
    ownerLogin?: string;
    ownerAvatar?: AvatarSource;
    threeDotMenuItems?: PopoverMenuItem[];
    type: ValueOf<typeof CONST.POLICY.TYPE>;
    role: ValueOf<typeof CONST.POLICY.ROLE>;
    iconType: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
    dismissError: () => void;
};

type WorkspaceListTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey, string>> | undefined;
    workspaces: WorkspaceRowData[];
};

export default function WorkspaceListTable({ref, workspaces}: WorkspaceListTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const workspaceTableColumns: Array<TableColumn<WorkspaceTableColumnKey>> = [
        {key: 'workspaces', label: translate('common.workspaces')},
        {key: 'owner', label: translate('common.owner')},
        {key: 'type', label: translate('workspace.common.workspaceType')},
        {key: 'actions', width: variables.workspaceTableActionColumnWidth, label: '', styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}},
    ];

    const compareTableItems: CompareItemsCallback<WorkspaceRowData, WorkspaceTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'workspaces') {
            return item1.title.localeCompare(item2.title) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'owner') {
            return (item1.ownerName ?? '').localeCompare(item2.ownerName ?? '') * orderMultiplier;
        }

        if (activeSorting.columnKey === 'type') {
            return item1.type.localeCompare(item2.type) * orderMultiplier;
        }

        return 0;
    };

    const isTableItemInSearch: IsItemInSearchCallback<WorkspaceRowData> = (item, searchValue) => {
        return item.title.toLowerCase().includes(searchValue.toLowerCase());
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<WorkspaceRowData>) => {
        return (
            <WorkspaceRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };

    return (
        <Table
            ref={ref}
            data={workspaces}
            columns={workspaceTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            keyExtractor={(row) => row.policyID}
            initialSortColumn="workspaces"
            title={translate('common.workspaces')}
            ListEmptyComponent={WorkspacesEmptyStateComponent}
        >
            {workspaces.length > CONST.SEARCH_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.common.findWorkspace')} />}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}
