import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsSettingsPage from '@pages/workspace/fields/FieldsSettingsPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type InvoiceFieldsSettingsPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_FIELDS_SETTINGS>;

function InvoiceFieldsSettingsPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: InvoiceFieldsSettingsPageProps) {
    return (
        <FieldsSettingsPage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED}
            expectedTarget={CONST.REPORT_FIELD_TARGETS.INVOICE}
            getListValuesRoute={(id, fieldID) => ROUTES.WORKSPACE_INVOICE_FIELDS_LIST_VALUES.getRoute(id, fieldID)}
            getInitialValueRoute={(id, fieldID) => ROUTES.WORKSPACE_INVOICE_FIELDS_EDIT_INITIAL_VALUE.getRoute(id, fieldID)}
            testID="InvoiceFieldsSettingsPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(InvoiceFieldsSettingsPage);
