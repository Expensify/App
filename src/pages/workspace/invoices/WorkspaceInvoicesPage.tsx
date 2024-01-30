import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceInvoicesNoVBAView from './WorkspaceInvoicesNoVBAView';
import WorkspaceInvoicesVBAView from './WorkspaceInvoicesVBAView';

/** Defined route object that contains the policyID param, WorkspacePageWithSections is a common component for Workspaces and expect the route prop that includes the policyID */
type WorkspaceInvoicesPageProps = {
    route: RouteProp<{params: {policyID: string}}>;
};

function WorkspaceInvoicesPage({route}: WorkspaceInvoicesPageProps) {
    const {translate} = useLocalize();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.invoices')}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INVOICES}
            route={route}
        >
            {(hasVBA?: boolean, policyID?: string) => (
                <>
                    {!hasVBA && policyID && <WorkspaceInvoicesNoVBAView policyID={policyID} />}
                    {hasVBA && policyID && <WorkspaceInvoicesVBAView policyID={policyID} />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';

export default WorkspaceInvoicesPage;
