import React from 'react';
import QuickbooksDesktopAutoSyncPageBase from '@pages/workspace/accounting/qbd/advanced/QuickbooksDesktopAutoSyncPageBase';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CardReconciliationQuickbooksDesktopAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    return (
        <QuickbooksDesktopAutoSyncPageBase
            policy={policy}
            navigateBackTo={ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.QBD)}
        />
    );
}

export default withPolicyConnections(CardReconciliationQuickbooksDesktopAutoSyncPage);
