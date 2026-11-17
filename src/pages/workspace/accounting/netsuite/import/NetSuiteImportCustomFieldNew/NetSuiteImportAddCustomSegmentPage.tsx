import useOnyx from '@hooks/useOnyx';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import NetSuiteImportAddCustomSegmentContent from './NetSuiteImportAddCustomSegmentContent';

function NetSuiteImportAddCustomSegmentPage({policy, route}: WithPolicyConnectionsProps) {
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM_DRAFT);

    return (
        <NetSuiteImportAddCustomSegmentContent
            policy={policy}
            policyIDParam={route.params.policyID}
            draftValues={draftValues}
        />
    );
}

export default withPolicyConnections(NetSuiteImportAddCustomSegmentPage);
