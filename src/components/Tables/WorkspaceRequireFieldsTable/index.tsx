import type {TableRenderRowProps} from '@components/Table';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceCategoryRulesTable from '@components/Tables/WorkspaceCategoryRulesTable';

import useLocalize from '@hooks/useLocalize';

import type {RequireFieldsTableItem} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import React from 'react';

import WorkspaceRequireFieldsTableRow from './WorkspaceRequireFieldsTableRow';

type WorkspaceRequireFieldsTableProps = {
    rulesData: RequireFieldsTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    emptyState: TableEmptyStateProps;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

function WorkspaceRequireFieldsTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, emptyState}: WorkspaceRequireFieldsTableProps) {
    const {translate} = useLocalize();

    const renderRow = ({item, rowIndex, shouldUseNarrowTableLayout}: TableRenderRowProps<RequireFieldsTableItem>) => (
        <WorkspaceRequireFieldsTableRow
            key={item.keyForList}
            item={item}
            rowIndex={rowIndex}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <WorkspaceCategoryRulesTable
            rulesData={rulesData}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            emptyState={emptyState}
            tableTitle={translate('workspace.rules.tabs.requireFields')}
            findRuleLabel={translate('workspace.rules.requireFieldsTable.findRule')}
            typeColumnLabel={translate('workspace.rules.requireFieldsTable.tableColumnType')}
            conditionColumnLabel={translate('workspace.rules.requireFieldsTable.tableColumnCondition')}
            ruleColumnLabel={translate('workspace.rules.requireFieldsTable.tableColumnRule')}
            renderRow={renderRow}
            typeColumnWidth={variables.tableRequireFieldsTypeColumnWidth}
        />
    );
}

export default WorkspaceRequireFieldsTable;
