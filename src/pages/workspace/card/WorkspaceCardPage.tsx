import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';

type WorkspaceCardPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CARD>;

function WorkspaceCardPage({route}: WorkspaceCardPageProps) {
    const {translate} = useLocalize();
    
    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.card')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
        >
            {(hasVBA: boolean, policyID: string, isUsingECard: boolean) => (
                <>
                    {false && <WorkspaceCardNoVBAView policyID={policyID} />}

                    {false && <WorkspaceCardVBANoECardView />}

                    {true && <WorkspaceCardVBAWithECardView />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default WorkspaceCardPage;
