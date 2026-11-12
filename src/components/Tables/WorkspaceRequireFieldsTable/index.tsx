import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {TableRenderRowProps} from '@components/Table';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceCategoryRulesTable from '@components/Tables/WorkspaceCategoryRulesTable';

import useLocalize from '@hooks/useLocalize';

import type {RequireFieldsTableItem} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React from 'react';

import WorkspaceRequireFieldsTableRow from './WorkspaceRequireFieldsTableRow';

type WorkspaceRequireFieldsTableProps = {
    rulesData: RequireFieldsTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    emptyState: TableEmptyStateProps;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;

    /** The actions the selected rules support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>>;
};

function WorkspaceRequireFieldsTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, headerComponent, emptyState, bulkActionOptions}: WorkspaceRequireFieldsTableProps) {
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
            headerComponent={headerComponent}
            bulkActionOptions={bulkActionOptions}
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
