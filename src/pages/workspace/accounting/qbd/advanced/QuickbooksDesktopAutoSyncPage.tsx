import React from 'react';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import QuickbooksDesktopAutoSyncPageBase from './QuickbooksDesktopAutoSyncPageBase';

function QuickbooksDesktopAutoSyncPage({policy}: WithPolicyConnectionsProps) {
    return <QuickbooksDesktopAutoSyncPageBase policy={policy} />;
}

QuickbooksDesktopAutoSyncPage.displayName = 'QuickbooksDesktopAutoSyncPage';

export default withPolicyConnections(QuickbooksDesktopAutoSyncPage);
