import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceBillsNoVBAView from './WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from './WorkspaceBillsVBAView';

type WorkspaceBillsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.BILLS>;

function WorkspaceBillsPage({route}: WorkspaceBillsPageProps) {
    const {translate} = useLocalize();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.bills')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BILLS}
        >
            {(hasVBA: boolean, policyID: string) => (
                <>
                    {!hasVBA && <WorkspaceBillsNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceBillsVBAView policyID={policyID} />}
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceBillsPage.displayName = 'WorkspaceBillsPage';

export default WorkspaceBillsPage;
