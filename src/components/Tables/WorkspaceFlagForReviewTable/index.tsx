import React from 'react';
import type {TableRenderRowProps} from '@components/Table';
import WorkspaceCategoryRulesTable from '@components/Tables/WorkspaceCategoryRulesTable';
import useLocalize from '@hooks/useLocalize';
import type {FlagForReviewTableItem} from '@libs/FlagForReviewRulesUtils';
import WorkspaceFlagForReviewTableRow from './WorkspaceFlagForReviewTableRow';

type WorkspaceFlagForReviewTableProps = {
    rulesData: FlagForReviewTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    emptyStateContent?: React.ReactElement;
};

function WorkspaceFlagForReviewTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, emptyStateContent}: WorkspaceFlagForReviewTableProps) {
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
            emptyStateContent={emptyStateContent}
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
