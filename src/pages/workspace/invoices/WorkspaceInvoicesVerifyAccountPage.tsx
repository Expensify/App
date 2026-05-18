import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceInvoicesVerifyAccountPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT>;
function WorkspaceInvoicesVerifyAccountPage({route}: WorkspaceInvoicesVerifyAccountPageProps) {
    const workspaceInvoicePath = ROUTES.WORKSPACE_INVOICES.getRoute(route.params.policyID);
    return (
        <VerifyAccountPageBase
            navigateBackTo={workspaceInvoicePath}
            navigateForwardTo={ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: route.params.policyID, backTo: workspaceInvoicePath})}
        />
    );
}

export default WorkspaceInvoicesVerifyAccountPage;
