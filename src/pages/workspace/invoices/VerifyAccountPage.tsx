import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceInvoicesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;
function VerifyAccountPage({route}: WorkspaceInvoicesPageProps) {
    const workspaceInvoicePath = ROUTES.WORKSPACE_INVOICES.getRoute(route.params.policyID);
    return (
        <VerifyAccountPageBase
            navigateBackTo={workspaceInvoicePath}
            navigateForwardTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(workspaceInvoicePath)}
        />
    );
}

export default VerifyAccountPage;
