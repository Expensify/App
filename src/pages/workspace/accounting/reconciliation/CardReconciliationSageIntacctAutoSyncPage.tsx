import React from 'react';
import SageIntacctAutoSyncPageBase from '@pages/workspace/accounting/intacct/advanced/SageIntacctAutoSyncPageBase';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CardReconciliationSageIntacctAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    return (
        <SageIntacctAutoSyncPageBase
            policy={policy}
            navigateBackTo={ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT)}
        />
    );
}

export default withPolicyConnections(CardReconciliationSageIntacctAutoSyncPage);
