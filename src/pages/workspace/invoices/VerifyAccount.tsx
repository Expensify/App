import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function VerifyAccountPage(policyID: string) {
    const workspaceInvoicePath = ROUTES.WORKSPACE_INVOICES.getRoute(policyID);
    return (
        <VerifyAccountPageBase
            navigateBackTo={workspaceInvoicePath}
            navigateForwardTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(workspaceInvoicePath)}
        />
    );
}

export default VerifyAccountPage;
