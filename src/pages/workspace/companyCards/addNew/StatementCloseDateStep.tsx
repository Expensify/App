import React from 'react';
import WorkspaceCompanyCardStatementCloseDateSelectionList from '../WorkspaceCompanyCardStatementCloseDateSelectionList';

type StatementCloseDateStepProps = {
    /** ID of the current policy */
    policyID: string | undefined;
};

function StatementCloseDateStep({policyID}: StatementCloseDateStepProps) {
    return <WorkspaceCompanyCardStatementCloseDateSelectionList />;
}

StatementCloseDateStep.displayName = 'StatementCloseDateStep';

export default StatementCloseDateStep;
