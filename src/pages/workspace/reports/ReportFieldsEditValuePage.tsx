import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import FieldsEditValuePage from '@pages/workspace/fields/FieldsEditValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ReportFieldsEditValuePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE>;

function ReportFieldsEditValuePage({
    policy,
    route: {
        params: {policyID, valueIndex},
    },
}: ReportFieldsEditValuePageProps) {
    return (
        <FieldsEditValuePage
            policy={policy}
            policyID={policyID}
            valueIndex={valueIndex}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            testID="ReportFieldsEditValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsEditValuePage);
