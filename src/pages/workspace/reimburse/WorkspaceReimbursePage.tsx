import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceReimburseView from './WorkspaceReimburseView';

type WorkspaceReimbursePageProps = WithPolicyProps & StackScreenProps<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACE.REIMBURSE>;

function WorkspaceReimbursePage({route, policy}: WorkspaceReimbursePageProps) {
    const {translate} = useLocalize();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.reimburse')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldShowLoading={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            {() => <WorkspaceReimburseView policy={policy} />}
        </WorkspacePageWithSections>
    );
}

WorkspaceReimbursePage.displayName = 'WorkspaceReimbursePage';

export default withPolicy(WorkspaceReimbursePage);
