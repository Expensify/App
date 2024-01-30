import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

type WorkspaceTravelPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL>;

function WorkspaceTravelPage({route}: WorkspaceTravelPageProps) {
    const {translate} = useLocalize();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.travel')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
        >
            {(hasVBA = false, policyID = '') => (
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
