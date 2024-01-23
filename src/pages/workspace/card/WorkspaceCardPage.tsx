import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';

/** Defined route object that contains the policyID param, WorkspacePageWithSections is a common component for Workspaces and expect the route prop that includes the policyID */
type WorkspaceCardPageProps = {
    route: RouteProp<{params: {policyID: string}}>;
};

function WorkspaceCardPage({route}: WorkspaceCardPageProps) {
    const {translate} = useLocalize();
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.card')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
        >
            {(hasVBA?: boolean, policyID?: string, isUsingECard?: boolean) => (
                <>
                    {!hasVBA && <WorkspaceCardNoVBAView policyID={policyID ?? ''} />}

                    {hasVBA && !isUsingECard && <WorkspaceCardVBANoECardView />}

                    {hasVBA && isUsingECard && <WorkspaceCardVBAWithECardView />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default WorkspaceCardPage;
