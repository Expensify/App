import React from 'react';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import SageIntacctAutoSyncPageBase from './SageIntacctAutoSyncPageBase';

function SageIntacctAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    return <SageIntacctAutoSyncPageBase policy={policy} />;
}

SageIntacctAutoSyncPage.displayName = 'SageIntacctAutoSyncPage';

export default withPolicyConnections(SageIntacctAutoSyncPage);
