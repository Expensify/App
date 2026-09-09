import {updateQuickbooksOnlineNonReimbursableBillDefaultVendor} from '@libs/actions/connections/QuickbooksOnline';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import React from 'react';

import QuickbooksNonReimbursableVendorSelectPage from './QuickbooksNonReimbursableVendorSelectPage';

function QuickbooksNonReimbursableDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    return (
        <QuickbooksNonReimbursableVendorSelectPage
            policy={policy}
            configKey="nonReimbursableBillDefaultVendor"
            updateVendor={updateQuickbooksOnlineNonReimbursableBillDefaultVendor}
            displayName="QuickbooksNonReimbursableDefaultVendorSelectPage"
        />
    );
}

export default withPolicyConnections(QuickbooksNonReimbursableDefaultVendorSelectPage);
