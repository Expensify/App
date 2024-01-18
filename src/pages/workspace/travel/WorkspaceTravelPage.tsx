import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

function WorkspaceTravelPage({route}: StackScreenProps<SettingsNavigatorParamList, 'Workspace_Travel'>) {
    const {translate} = useLocalize();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.travel')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
        >
            {(hasVBA: boolean, policyID: string) => (
                <>
                    {!hasVBA && <WorkspaceTravelNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceTravelVBAView />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default WorkspaceTravelPage;
