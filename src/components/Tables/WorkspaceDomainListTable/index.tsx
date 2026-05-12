import {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import {ValueOf} from 'type-fest';
import {PopoverMenuItem} from '@components/PopoverMenu';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
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
    domainAccountID: number;
    title: string;
    isAdmin: boolean;
    isValidated: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
};

type WorkspaceListTableProps = {
    domains: DomainRowData[];
    workspaces: WorkspaceRowData[];
};

export default function WorkspaceDomainListTable({domains, workspaces}: WorkspaceListTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

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

    const compareDomainItems: CompareItemsCallback<DomainRowData, DomainTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'domains') {
            return item1.title.localeCompare(item2.title) * orderMultiplier;
        }

        return 0;
    };

    const compareWorkspaceItems: CompareItemsCallback<WorkspaceRowData, WorkspaceTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'workspaces') {
            return item1.title.localeCompare(item2.title) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'owner' && item1.ownerName && item2.ownerName) {
            return item1.ownerName.localeCompare(item2.ownerName) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'type') {
            return item1.type.localeCompare(item2.type) * orderMultiplier;
        }

        return 0;
    };

    const isDomainItemInSearch: IsItemInSearchCallback<DomainRowData> = (item, searchValue) => {
        const searchLowerCase = searchValue.toLowerCase();
        return item.title.toLowerCase().includes(searchLowerCase);
    };

    const isWorkspaceItemInSearch: IsItemInSearchCallback<WorkspaceRowData> = (item, searchValue) => {
        const searchLowerCase = searchValue.toLowerCase();
        return item.title.toLowerCase().includes(searchLowerCase);
    };

    const renderDomainItem = ({item, index}: ListRenderItemInfo<DomainRowData>) => {
        return (
            <DomainTableRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };

    const renderWorkspaceItem = ({item, index}: ListRenderItemInfo<WorkspaceRowData>) => {
        return (
            <WorkspaceRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };

    // <Table
    //         data={domains}
    //         columns={domainTableColumns}
    //         renderItem={renderDomainItem}
    //         compareItems={compareDomainItems}
    //         isItemInSearch={isDomainItemInSearch}
    //         keyExtractor={(row) => row.domainAccountID.toString()}
    //         title={translate('common.domains')}
    //     >
    //         <Table.Header />
    //         <Table.Body />
    //     </Table>

    return (
        <>
            <Table
                data={workspaces}
                columns={workspaceTableColumns}
                renderItem={renderWorkspaceItem}
                compareItems={compareWorkspaceItems}
                isItemInSearch={isWorkspaceItemInSearch}
                keyExtractor={(row) => row.policyID}
                initialSortColumn="workspaces"
                title={translate('common.workspaces')}
            >
                <Table.SearchBar label={translate('workspace.common.findWorkspace')} />

                <Table.Header />
                <Table.Body />
            </Table>
        </>
    );
}
