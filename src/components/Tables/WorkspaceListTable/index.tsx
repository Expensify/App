import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {ValueOf} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {getUserFriendlyWorkspaceType} from '@libs/PolicyUtils';
import type {AvatarSource} from '@libs/UserUtils';
import WorkspacesEmptyStateComponent from '@pages/workspace/WorkspacesEmptyStateComponent';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceRow from './WorkspaceTableRow';

type WorkspaceTableColumnKey = 'workspaces' | 'owner' | 'type' | 'actions';

type WorkspaceRowData = TableData & {
    title: string;
    icon: AvatarSource;
    isDefault: boolean;
    isDeleted: boolean;
    isLoadingBill: boolean;
    isJoinRequestPending: boolean;
    shouldAnimateInHighlight: boolean;
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
    action: (event?: ModifiedMouseEvent) => void;
    dismissError: () => void;
    resetLoadingSpinnerIconIndex?: () => void;
};

type WorkspaceListTableProps = {
    ref?: React.Ref<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey, string>> | undefined;
    workspaces: WorkspaceRowData[];
    children: React.ReactNode;
};

function WorkspaceListTable({ref, workspaces, children}: WorkspaceListTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const workspaceTableColumns: Array<TableColumn<WorkspaceTableColumnKey>> = [
        {
            sortable: true,
            key: 'workspaces',
            label: translate('common.workspaces'),
        },
        {
            sortable: true,
            key: 'owner',
            label: translate('common.owner'),
        },
        {
            sortable: true,
            key: 'type',
            label: translate('workspace.common.workspaceType'),
        },
        {
            sortable: false,
            key: 'actions',
            width: variables.workspaceTableActionColumnWidth,
            label: '',
            styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]},
        },
    ];

    const compareTableItems: CompareItemsCallback<WorkspaceRowData, WorkspaceTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'workspaces') {
            return orderMultiplier * localeCompare(item1.title, item2.title);
        }

        if (activeSorting.columnKey === 'owner') {
            return orderMultiplier * localeCompare(item1.ownerName ?? '', item2.ownerName ?? '');
        }

        if (activeSorting.columnKey === 'type') {
            return orderMultiplier * localeCompare(getUserFriendlyWorkspaceType(item1.type, translate), getUserFriendlyWorkspaceType(item2.type, translate));
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
            initialSortColumn="workspaces"
            title={translate('common.workspaces')}
            ListEmptyComponent={WorkspacesEmptyStateComponent}
            keyExtractor={(row, index) => `${row.policyID}-${index}`}
        >
            {children}
        </Table>
    );
}

function WorkspaceListTableContent() {
    return (
        <>
            <Table.Header />
            <Table.Body />
        </>
    );
}

function WorkspaceListTableSearchBar() {
    const {translate} = useLocalize();
    const {originalDataLength} = useTableContext();

    if (originalDataLength < CONST.STANDARD_LIST_ITEM_LIMIT) {
        return null;
    }

    return (
        <Table.SearchBar
            compact
            label={translate('workspace.common.findWorkspace')}
        />
    );
}

const WorkspaceListTableCompound = Object.assign(WorkspaceListTable, {
    Content: WorkspaceListTableContent,
    SearchBar: WorkspaceListTableSearchBar,
});

export default WorkspaceListTableCompound;
export type {WorkspaceRowData, WorkspaceTableColumnKey};
