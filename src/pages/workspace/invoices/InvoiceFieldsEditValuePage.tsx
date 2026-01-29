import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsEditValuePage from '@pages/workspace/fields/FieldsEditValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type InvoiceFieldsEditValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_FIELDS_EDIT_VALUE>;

function InvoiceFieldsEditValuePage({
    policy,
    route: {
        params: {policyID, valueIndex},
    },
}: InvoiceFieldsEditValuePageProps) {
    return (
        <FieldsEditValuePage
            policy={policy}
            policyID={policyID}
            valueIndex={valueIndex}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            testID="InvoiceFieldsEditValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(InvoiceFieldsEditValuePage);
