import useDynamicBackPath from '@hooks/useDynamicBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import FieldsInitialListValuePage from '@pages/workspace/fields/FieldsInitialListValuePage';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DynamicReportFieldsInitialListValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_REPORT_FIELDS_INITIAL_LIST_VALUE>;

function DynamicReportFieldsInitialListValuePage({
    policy,
    route: {
        params: {policyID},
    },
}: DynamicReportFieldsInitialListValuePageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_REPORT_FIELDS_INITIAL_LIST_VALUE.path);

    return (
        <FieldsInitialListValuePage
            policy={policy}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            backPath={backPath}
            subtitleKey="workspace.reportFields.listValuesInputSubtitle"
            testID="DynamicReportFieldsInitialListValuePage"
        />
    );
}

export default withPolicyAndFullscreenLoading(DynamicReportFieldsInitialListValuePage);
