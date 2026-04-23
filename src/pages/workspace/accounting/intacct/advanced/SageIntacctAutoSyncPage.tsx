import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SageIntacctAutoSyncPageBase from './SageIntacctAutoSyncPageBase';

function SageIntacctAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_AUTO_SYNC.path);

    return (
        <SageIntacctAutoSyncPageBase
            policy={policy}
            navigateBackTo={backPath}
        />
    );
}

export default withPolicyConnections(SageIntacctAutoSyncPage);
