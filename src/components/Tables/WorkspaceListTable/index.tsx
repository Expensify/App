import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import {ValueOf} from 'type-fest';
import {PopoverMenuItem} from '@components/PopoverMenu';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {AvatarSource} from '@libs/UserUtils';
import CONST from '@src/CONST';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import DomainTableRow from './DomainTableRow';
import WorkspaceRow from './WorkspaceTableRow';

type WorkspaceTableColumnKey = 'workspaces' | 'owner' | 'type' | 'actions';

type DomainTableColumnKey = 'domains' | 'actions';

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

export type DomainRowData = {
    rowType: 'domain';
    domainAccountID: number;
    title: string;
    isAdmin: boolean;
    isValidated: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
};

export type SpacerData = {
    rowType: 'spacer';
};

export type WorkspaceDomainListItemData = WorkspaceRowData | DomainRowData | SpacerData;

type WorkspaceListTableProps = {
    domains: DomainRowData[];
    workspaces: WorkspaceRowData[];
};

export default function WorkspaceListTable({domains, workspaces}: WorkspaceListTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const tableData = [...workspaces, {rowType: 'spacer'} as SpacerData, ...domains] as WorkspaceDomainListItemData[];

    const workspaceTableColumns: Array<TableColumn<WorkspaceTableColumnKey>> = [
        {key: 'workspaces', label: translate('common.workspaces')},
        {key: 'owner', label: translate('common.owner')},
        {key: 'type', label: translate('workspace.common.workspaceType')},
        {key: 'actions', label: '', styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}},
    ];

    const domainTableColumns: Array<TableColumn<DomainTableColumnKey>> = [
        {key: 'domains', label: translate('common.domains')},
        {key: 'actions', label: '', styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]}},
    ];

    const compareTableItems: CompareItemsCallback<WorkspaceDomainListItemData, WorkspaceTableColumnKey> = (item1, item2, activeSorting) => {
        if (item1.rowType !== 'workspace' || item2.rowType !== 'workspace') {
            return 0;
        }

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

    const isTableItemInSearch: IsItemInSearchCallback<WorkspaceDomainListItemData> = (item, searchValue) => {
        if (item.rowType === 'domain') {
            return item.title.toLowerCase().includes(searchValue.toLowerCase());
        }

        if (item.rowType === 'workspace') {
            return item.title.toLowerCase().includes(searchValue.toLowerCase());
        }

        return false;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<WorkspaceDomainListItemData>) => {
        if (item.rowType === 'spacer') {
            return <View style={styles.mb5} />;
        }

        if (item.rowType === 'workspace') {
            return (
                <WorkspaceRow
                    item={item}
                    rowIndex={index}
                    shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
                />
            );
        }

        if (item.rowType === 'domain') {
            return (
                <DomainTableRow
                    item={item}
                    rowIndex={index}
                    shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
                />
            );
        }

        return null;
    };

    return (
        <Table
            data={tableData}
            columns={workspaceTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            // JACK_TODO
            keyExtractor={(row) => ''}
            initialSortColumn="workspaces"
            title={translate('common.workspaces')}
        >
            <Table.SearchBar label={translate('workspace.common.findWorkspace')} />

            <Table.Header />
            <Table.Body />
        </Table>
    );
}
