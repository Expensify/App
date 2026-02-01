import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsAddListValuePage from '@pages/workspace/fields/FieldsAddListValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ReportFieldsAddListValuePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE>;

function ReportFieldsAddListValuePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsAddListValuePageProps) {
    return (
        <FieldsAddListValuePage
            policy={policy}
            policyID={policyID}
            reportFieldID={reportFieldID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            testID="ReportFieldsAddListValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsAddListValuePage);
