import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import NetSuiteImportAddCustomSegmentContent from './NetSuiteImportAddCustomSegmentContent';

function NetSuiteImportAddCustomSegmentPage({policy}: WithPolicyConnectionsProps) {
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM_DRAFT);
    const isLoading = isLoadingOnyxValue(draftValuesMetadata);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <NetSuiteImportAddCustomSegmentContent
            policy={policy}
            draftValues={draftValues}
        />
    );
}

NetSuiteImportAddCustomSegmentPage.displayName = 'NetSuiteImportAddCustomSegmentPage';

export default withPolicyConnections(NetSuiteImportAddCustomSegmentPage);
