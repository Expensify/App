import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsInitialValuePage from '@pages/workspace/fields/FieldsInitialValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ReportFieldsInitialValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE>;

function ReportFieldsInitialValuePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsInitialValuePageProps) {
    return (
        <FieldsInitialValuePage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            testID="ReportFieldsInitialValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsInitialValuePage);
