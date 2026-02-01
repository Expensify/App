import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsValueSettingsPage from '@pages/workspace/fields/FieldsValueSettingsPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldsValueSettingsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS>;

function ReportFieldsValueSettingsPage({
    policy,
    route: {
        params: {policyID, valueIndex, reportFieldID},
    },
}: ReportFieldsValueSettingsPageProps) {
    return (
        <FieldsValueSettingsPage
            policy={policy}
            policyID={policyID}
            valueIndex={valueIndex}
            reportFieldID={reportFieldID}
            isInvoicePage={false}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            getEditValueRoute={(isInvoiceRoute, id, index) =>
                isInvoiceRoute ? ROUTES.WORKSPACE_INVOICE_FIELDS_EDIT_VALUE.getRoute(id, index) : ROUTES.WORKSPACE_REPORT_FIELDS_EDIT_VALUE.getRoute(id, index)
            }
            testID="ReportFieldsValueSettingsPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsValueSettingsPage);
