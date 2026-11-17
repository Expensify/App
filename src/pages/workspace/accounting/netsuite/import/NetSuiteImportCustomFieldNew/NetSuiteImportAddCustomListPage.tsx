import useOnyx from '@hooks/useOnyx';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import NetSuiteImportAddCustomListContent from './NetSuiteImportAddCustomListContent';

function NetSuiteImportAddCustomListPage({policy, route}: WithPolicyConnectionsProps) {
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT);

    return (
        <NetSuiteImportAddCustomListContent
            policy={policy}
            policyIDParam={route.params.policyID}
            draftValues={draftValues}
        />
    );
}

export default withPolicyConnections(NetSuiteImportAddCustomListPage);
