import useLocalize from '@hooks/useLocalize';

import {updateMergeApprovalMode} from '@libs/actions/connections/merge';
import {getConnectedHRProvider} from '@libs/merge/HRUtils';
import {isMergeConnected} from '@libs/merge/MergeUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import HRApprovalModePageBase from '@pages/workspace/hr/HRApprovalModePageBase';
import type {HRApprovalModeProviderConfig} from '@pages/workspace/hr/HRApprovalModePageBase';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React from 'react';

type MergeHRApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_APPROVAL_MODE>;

function MergeHRApprovalModePage({
    route: {
        params: {policyID},
    },
}: MergeHRApprovalModePageProps) {
    const {translate} = useLocalize();

    const config: HRApprovalModeProviderConfig<ValueOf<typeof CONST.MERGE.APPROVAL_MODE>> = {
        testID: 'MergeHRApprovalModePage',
        isConnected: (policy) => isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR),
        approvalModes: CONST.MERGE.APPROVAL_MODE,
        getCurrentApprovalMode: (policy) => policy?.connections?.merge_hris?.config?.approvalMode ?? null,
        getProviderName: (policy) => getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris,
        getHeaderTitle: (providerName) => translate('workspace.hr.providerApprovalMode', providerName),
        handleSave: ({draftApprovalMode, currentApprovalMode}) => updateMergeApprovalMode(policyID, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR, draftApprovalMode, currentApprovalMode),
    };

    return (
        <HRApprovalModePageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default MergeHRApprovalModePage;
