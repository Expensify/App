import type {TableRenderRowProps} from '@components/Table';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceCategoryRulesTable from '@components/Tables/WorkspaceCategoryRulesTable';

import useLocalize from '@hooks/useLocalize';

import type {FlagForReviewTableItem} from '@libs/FlagForReviewRulesUtils';

import React from 'react';

import WorkspaceFlagForReviewTableRow from './WorkspaceFlagForReviewTableRow';

type WorkspaceFlagForReviewTableProps = {
    rulesData: FlagForReviewTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;
    emptyState: TableEmptyStateProps;
};

function WorkspaceFlagForReviewTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, headerComponent, emptyState}: WorkspaceFlagForReviewTableProps) {
    const {translate} = useLocalize();

    const renderRow = ({item, rowIndex, shouldUseNarrowTableLayout}: TableRenderRowProps<FlagForReviewTableItem>) => (
        <WorkspaceFlagForReviewTableRow
            key={item.ruleID}
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
            emptyState={emptyState}
            tableTitle={translate('workspace.rules.tabs.flagForReview')}
            findRuleLabel={translate('workspace.rules.flagForReviewTable.findRule')}
            typeColumnLabel={translate('workspace.rules.flagForReviewTable.tableColumnType')}
            conditionColumnLabel={translate('workspace.rules.flagForReviewTable.tableColumnCondition')}
            ruleColumnLabel={translate('workspace.rules.flagForReviewTable.tableColumnRule')}
            renderRow={renderRow}
        />
    );
}

export default WorkspaceFlagForReviewTable;
