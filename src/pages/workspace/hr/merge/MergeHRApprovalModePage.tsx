import React from 'react';
import type {ValueOf} from 'type-fest';
import {updateMergeHRApprovalMode} from '@libs/actions/connections/MergeHR';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedHRProvider, isMergeHRConnected} from '@libs/PolicyUtils';
import HRApprovalModePageBase from '@pages/workspace/hr/HRApprovalModePageBase';
import type {HRApprovalModeProviderConfig} from '@pages/workspace/hr/HRApprovalModePageBase';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MergeHRApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_APPROVAL_MODE>;

const mergeApprovalModeConfig: HRApprovalModeProviderConfig<ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE>> = {
    testID: 'MergeHRApprovalModePage',
    beta: CONST.BETAS.MERGE_HR,
    isConnected: isMergeHRConnected,
    approvalModes: CONST.MERGE_HR.APPROVAL_MODE,
    getCurrentApprovalMode: (policy) => policy?.connections?.merge_hris?.config?.approvalMode ?? null,
    getProviderName: (policy) => getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris,
    getHeaderTitle: (providerName, translate) => translate('workspace.hr.providerApprovalMode', providerName),
    onSave: ({policyID, draftApprovalMode, currentApprovalMode}) => updateMergeHRApprovalMode(policyID, draftApprovalMode, currentApprovalMode),
};

function MergeHRApprovalModePage({
    route: {
        params: {policyID},
    },
}: MergeHRApprovalModePageProps) {
    return (
        <HRApprovalModePageBase
            policyID={policyID}
            config={mergeApprovalModeConfig}
        />
    );
}

export default MergeHRApprovalModePage;
