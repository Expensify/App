import {updateQuickbooksOnlineNonReimbursableCreditCardDefaultVendor} from '@libs/actions/connections/QuickbooksOnline';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import React from 'react';

import QuickbooksNonReimbursableVendorSelectPage from './QuickbooksNonReimbursableVendorSelectPage';

function QuickbooksNonReimbursableCreditCardDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    return (
        <QuickbooksNonReimbursableVendorSelectPage
            policy={policy}
            configKey="nonReimbursableCreditCardDefaultVendor"
            updateVendor={updateQuickbooksOnlineNonReimbursableCreditCardDefaultVendor}
            displayName="QuickbooksNonReimbursableCreditCardDefaultVendorSelectPage"
        />
    );
}

export default withPolicyConnections(QuickbooksNonReimbursableCreditCardDefaultVendorSelectPage);
