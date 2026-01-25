import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsAddListValuePage from '@pages/workspace/fields/FieldsAddListValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type InvoiceFieldsAddListValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_FIELDS_ADD_VALUE>;

function InvoiceFieldsAddListValuePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: InvoiceFieldsAddListValuePageProps) {
    return (
        <FieldsAddListValuePage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            testID="InvoiceFieldsAddListValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(InvoiceFieldsAddListValuePage);
