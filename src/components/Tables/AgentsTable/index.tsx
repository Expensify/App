import RenderHTML from '@components/RenderHTML';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableHandle} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {AgentOwnerType} from '@src/types/onyx/Agent';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import AgentsTableRow from './AgentsTableRow';

type AgentsTableColumnKey = 'agent' | 'role' | 'actions';

type AgentRowData = TableData & {
    accountID: number;
    displayName: string;
    login: string;
    role?: ValueOf<typeof CONST.POLICY.ROLE>;
    ownerAccountID?: number;
    ownerType?: AgentOwnerType;
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

    /** Content rendered above the table header inside the scrollable list */
    headerComponent?: React.ReactElement;

    /** Whether rows can be selected (enables selection UI) */
    canSelectAgents: boolean;

    /** Keys of the currently selected rows */
    selectedKeys: string[];

    /** Whether to show the role column */
    shouldShowRoleColumn?: boolean;

    /** The policy to resolve the agents roles against. Needed when shouldShowRoleColumn=true  */
    policy?: OnyxEntry<Policy>;

    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function AgentsTable({ref, agents, headerComponent, canSelectAgents, selectedKeys, shouldShowRoleColumn, policy, onRowSelectionChange}: AgentsTableProps) {
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
                      dynamicSizing: {
                          getContentToMeasure: (item: AgentRowData) => [{text: translate('workspace.common.roleName', item.role), fontSize: fontScale.text}],
                          // A role is one of a short, known set of labels, so the column always shows them in full.
                          shouldFitContent: true,
                          // Padding and border sit inside the track. A role is pinned to its text, so that chrome has to be measured or the label clips.
                          extraWidth: variables.editableCellChromeWidth,
                      },
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
        return localeCompare(item1.displayName, item2.displayName) * orderMultiplier;
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
            policy={policy}
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
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {AgentRowData, AgentsTableColumnKey};
