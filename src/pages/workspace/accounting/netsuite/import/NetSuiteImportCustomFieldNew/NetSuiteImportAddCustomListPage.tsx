import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import withPolicyConnections, {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import NetSuiteImportAddCustomListContent from './NetSuiteImportAddCustomListContent';

function NetSuiteImportAddCustomListPage({policy}: WithPolicyConnectionsProps) {
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT);
    const isLoading = isLoadingOnyxValue(draftValuesMetadata);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <NetSuiteImportAddCustomListContent
            policy={policy}
            draftValues={draftValues}
        />
    );
}

NetSuiteImportAddCustomListPage.displayName = 'NetSuiteImportAddCustomListPage';

export default withPolicyConnections(NetSuiteImportAddCustomListPage);
