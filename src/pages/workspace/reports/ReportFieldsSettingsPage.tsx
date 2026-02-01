import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsSettingsPage from '@pages/workspace/fields/FieldsSettingsPage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldsSettingsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS>;

function ReportFieldsSettingsPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsSettingsPageProps) {
    return (
        <FieldsSettingsPage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            expectedTarget={CONST.REPORT_FIELD_TARGETS.EXPENSE}
            getListValuesRoute={(id, fieldID) => ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(id, fieldID)}
            getInitialValueRoute={(id, fieldID) => ROUTES.WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE.getRoute(id, fieldID)}
            testID="ReportFieldsSettingsPage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsSettingsPage);
