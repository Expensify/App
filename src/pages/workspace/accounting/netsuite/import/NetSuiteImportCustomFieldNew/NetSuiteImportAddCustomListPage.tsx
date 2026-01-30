import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import NetSuiteImportAddCustomListContent from './NetSuiteImportAddCustomListContent';

function NetSuiteImportAddCustomListPage({policy, route}: WithPolicyConnectionsProps) {
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT, {canBeMissing: true});
    const isLoading = isLoadingOnyxValue(draftValuesMetadata);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <NetSuiteImportAddCustomListContent
            policy={policy}
            route={route}
            draftValues={draftValues}
        />
    );
}

export default withPolicyConnections(NetSuiteImportAddCustomListPage);
