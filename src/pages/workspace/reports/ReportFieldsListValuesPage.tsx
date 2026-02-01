import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsListValuesPage from '@pages/workspace/fields/FieldsListValuesPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldsListValuesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES>;

function ReportFieldsListValuesPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsListValuesPageProps) {
    return (
        <FieldsListValuesPage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            isInvoicePage={false}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            getValueSettingsRoute={(isInvoiceRoute, id, valueIndex, fieldID) =>
                isInvoiceRoute
                    ? ROUTES.WORKSPACE_INVOICE_FIELDS_VALUE_SETTINGS.getRoute(id, valueIndex, fieldID)
                    : ROUTES.WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.getRoute(id, valueIndex, fieldID)
            }
            getAddValueRoute={(isInvoiceRoute, id, fieldID) =>
                isInvoiceRoute ? ROUTES.WORKSPACE_INVOICE_FIELDS_ADD_VALUE.getRoute(id, fieldID) : ROUTES.WORKSPACE_REPORT_FIELDS_ADD_VALUE.getRoute(id, fieldID)
            }
            testID="ReportFieldsListValuesPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsListValuesPage);
