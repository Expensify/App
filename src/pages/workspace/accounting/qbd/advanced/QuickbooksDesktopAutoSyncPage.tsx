import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import React from 'react';

import QuickbooksDesktopAutoSyncPageBase from './QuickbooksDesktopAutoSyncPageBase';

function QuickbooksDesktopAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    return <QuickbooksDesktopAutoSyncPageBase policy={policy} />;
}

export default withPolicyConnections(QuickbooksDesktopAutoSyncPage);
