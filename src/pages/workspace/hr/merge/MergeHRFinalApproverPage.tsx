import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {updateMergeHRFinalApprover} from '@libs/actions/connections/MergeHR';
import {getConnectedHRProvider, isMergeHRConnected} from '@libs/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import HRFinalApproverPageBase from '@pages/workspace/hr/HRFinalApproverPageBase';
import type {HRFinalApproverProviderConfig} from '@pages/workspace/hr/HRFinalApproverPageBase';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MergeHRFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_FINAL_APPROVER>;

function MergeHRFinalApproverPage({
    route: {
        params: {policyID},
    },
}: MergeHRFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: HRFinalApproverProviderConfig = {
        testID: 'MergeHRFinalApproverPage',
        beta: CONST.BETAS.MERGE_HR,
        isConnected: isMergeHRConnected,
        getCurrentFinalApprover: (policy) => policy?.connections?.merge_hris?.config?.finalApprover ?? null,
        getProviderName: (policy) => getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris,
        getHeaderTitle: (providerName) => translate('workspace.hr.providerFinalApprover', providerName),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateMergeHRFinalApprover(id, email, currentFinalApprover),
    };

    return (
        <HRFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default MergeHRFinalApproverPage;
