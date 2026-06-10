import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CreateFieldsPage from '@pages/workspace/fields/CreateFieldsPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CreateReportFieldsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE>;

function WorkspaceCreateReportFieldsPage({
    policy,
    route: {
        params: {policyID},
    },
}: CreateReportFieldsPageProps) {
    return (
        <CreateFieldsPage
            policy={policy}
            policyID={policyID}
            isInvoiceField={false}
            listValuesRoute={ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID)}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            testID="WorkspaceCreateReportFieldsPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceCreateReportFieldsPage);
