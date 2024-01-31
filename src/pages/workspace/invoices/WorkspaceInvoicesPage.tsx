import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceInvoicesNoVBAView from './WorkspaceInvoicesNoVBAView';
import WorkspaceInvoicesVBAView from './WorkspaceInvoicesVBAView';

type WorkspaceInvoicesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;

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
