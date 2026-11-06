import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {EmptyStateButton} from '@components/EmptyStateComponent/types';
import RenderHTML from '@components/RenderHTML';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';
import compareOptionalValues from '@components/Table/compareOptionalValues';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AgentOwnerType} from '@src/types/onyx/Agent';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import AgentsTableRow from './AgentsTableRow';

type AgentsTableColumnKey = 'agent' | 'role' | 'owner' | 'actions';

type AgentRowData = TableData & {
    accountID: number;
    displayName: string;
    login: string;
    role?: ValueOf<typeof CONST.POLICY.ROLE>;

    /** The accountID of the agent owner */
    ownerAccountID?: number;

    /** The display name of the agent owner */
    ownerDisplayName?: string;

    /** The type of the agent owner */
    ownerType?: AgentOwnerType;

    /** The policy ID of the agent owner, only set if ownerType=workspace */
    ownerPolicyID?: string;

    canManage: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onChatPress: () => void;
    onCopilotPress: () => void;
    dismissError: () => void;
};

type AgentsTableProps = {
    ref?: React.Ref<TableHandle<AgentRowData, AgentsTableColumnKey, string>> | undefined;
    agents: AgentRowData[];

    /** Buttons to display on empty view */
    emptyStateButtons?: EmptyStateButton[];

    /** Content rendered above the table header inside the scrollable list */
    headerComponent?: React.ReactElement;

    /** Whether rows can be selected (enables selection UI) */
    canSelectAgents: boolean;

    /** Keys of the currently selected rows */
    selectedKeys: string[];

    /** Whether to show the role column */
    shouldShowRoleColumn?: boolean;

    /** Whether to show the owner column */
    shouldShowOwnerColumn?: boolean;

    onRowSelectionChange: (selectedRowKeys: string[]) => void;

    /** The actions the selected agents support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>>;
};

export default function AgentsTable({
    ref,
    agents,
    emptyStateButtons,
    headerComponent,
    canSelectAgents,
    selectedKeys,
    shouldShowRoleColumn,
    shouldShowOwnerColumn,
    onRowSelectionChange,
    bulkActionOptions,
}: AgentsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['TvScreenRobot', 'AiBot']);

    const [areAgentsLoaded] = useOnyx(ONYXKEYS.ARE_AGENTS_LOADED);

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const agentsTableColumns: Array<TableColumn<AgentsTableColumnKey, AgentRowData>> = [
        {
            key: 'agent',
            label: translate('agentsPage.title'),
            sortable: true,
        },
        ...(shouldShowRoleColumn
            ? [
                  {
                      key: 'role' as const,
                      label: translate('common.role'),
                      sortable: true,
                      styling: {
                          // editableCellHeader matches the padded role cell so the label and value share an edge.
                          containerStyles: [styles.editableCellHeader],
                      },
                  },
              ]
            : []),
        ...(shouldShowOwnerColumn
            ? [
                  {
                      key: 'owner' as const,
                      label: translate('common.owner'),
                      sortable: true,
                  },
              ]
            : []),
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: shouldUseNarrowTableLayout ? variables.tableCaretColumnWidth : variables.agentsTableActionColumnWidth,
        },
    ];

    const compareTableItems: CompareItemsCallback<AgentRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        const displayNameComparison = localeCompare(item1.displayName, item2.displayName) * orderMultiplier;

        if (activeSorting.columnKey === 'role') {
            const compareRoleNames = (role1: string, role2: string) => localeCompare(translate('workspace.common.roleName', role1), translate('workspace.common.roleName', role2));
            return compareOptionalValues(item1.role, item2.role, compareRoleNames, orderMultiplier, displayNameComparison);
        }

        if (activeSorting.columnKey === 'owner') {
            const compareOwnerDisplayNames = (ownerDisplayName1: string, ownerDisplayName2: string) => localeCompare(ownerDisplayName1, ownerDisplayName2);
            return compareOptionalValues(item1.ownerDisplayName, item2.ownerDisplayName, compareOwnerDisplayNames, orderMultiplier, displayNameComparison);
        }

        return displayNameComparison;
    };

    const isTableItemInSearch: IsItemInSearchCallback<AgentRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.displayName, option.login]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<AgentRowData>) => (
        <AgentsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            shouldShowRoleColumn={shouldShowRoleColumn}
            shouldShowOwnerColumn={shouldShowOwnerColumn}
        />
    );

    if (!areAgentsLoaded) {
        // The page header stays visible above the loading skeleton so the layout doesn't jump once the table renders.
        return (
            <>
                {headerComponent}
                <Table.LoadingState />
            </>
        );
    }

    const searchBarComponent = <Table.FilterBar label={translate('agentsPage.findAgent')} />;
    const tableHeaderComponent = composeTableListHeader(headerComponent, searchBarComponent);

    return (
        <Table
            ref={ref}
            data={agents}
            columns={agentsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="agent"
            title={translate('agentsPage.title')}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled={canSelectAgents}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.EmptyState
                headerMedia={illustrations.TvScreenRobot}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.agentsPageEmptyStateIllustration}
                title={translate('agentsPage.emptyAgents.title')}
                subtitleText={
                    <View style={[styles.renderHTML, styles.textAlignCenter, styles.alignItemsCenter, !shouldUseNarrowLayout && styles.agentsPageEmptyStateSubtitle]}>
                        <RenderHTML html={translate('agentsPage.emptyAgents.subtitle')} />
                    </View>
                }
                buttons={emptyStateButtons}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
            {!!bulkActionOptions && <Table.BulkActionBar options={bulkActionOptions} />}
        </Table>
    );
}

export type {AgentRowData, AgentsTableColumnKey};
