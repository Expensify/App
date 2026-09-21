import useLocalize from '@hooks/useLocalize';

import {updateMergeFinalApprover} from '@libs/actions/connections/merge';
import {getConnectedHRProvider} from '@libs/merge/HRUtils';
import {isMergeConnected} from '@libs/merge/MergeUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import HRFinalApproverPageBase from '@pages/workspace/hr/HRFinalApproverPageBase';
import type {HRFinalApproverProviderConfig} from '@pages/workspace/hr/HRFinalApproverPageBase';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type MergeHRFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_FINAL_APPROVER>;

function MergeHRFinalApproverPage({
    route: {
        params: {policyID},
    },
}: MergeHRFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: HRFinalApproverProviderConfig = {
        testID: 'MergeHRFinalApproverPage',
        isConnected: (policy) => isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR),
        getCurrentFinalApprover: (policy) => policy?.connections?.merge_hris?.config?.finalApprover ?? null,
        getProviderName: (policy) => getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris,
        getHeaderTitle: (providerName) => translate('workspace.hr.providerFinalApprover', providerName),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateMergeFinalApprover(id, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR, email, currentFinalApprover),
    };

    return (
        <HRFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default MergeHRFinalApproverPage;
