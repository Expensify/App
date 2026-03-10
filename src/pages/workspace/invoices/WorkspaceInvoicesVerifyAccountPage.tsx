import React from 'react';
import createDynamicRoute from '@libs/Navigation/helpers/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceInvoicesVerifyAccountPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT>;
function WorkspaceInvoicesVerifyAccountPage({route}: WorkspaceInvoicesVerifyAccountPageProps) {
    const workspaceInvoicePath = ROUTES.WORKSPACE_INVOICES.getRoute(route.params.policyID);
    return (
        <VerifyAccountPageBase
            navigateBackTo={workspaceInvoicePath}
            navigateForwardTo={createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT.path)}
        />
    );
}

export default WorkspaceInvoicesVerifyAccountPage;
