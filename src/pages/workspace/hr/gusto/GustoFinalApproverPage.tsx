import useLocalize from '@hooks/useLocalize';

import {updateGustoFinalApprover} from '@libs/actions/connections/Gusto';
import {isGustoConnected} from '@libs/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import HRFinalApproverPageBase from '@pages/workspace/hr/HRFinalApproverPageBase';
import type {HRFinalApproverProviderConfig} from '@pages/workspace/hr/HRFinalApproverPageBase';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type GustoFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_FINAL_APPROVER>;

function GustoFinalApproverPage({
    route: {
        params: {policyID},
    },
}: GustoFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: HRFinalApproverProviderConfig = {
        testID: 'GustoFinalApproverPage',
        isConnected: isGustoConnected,
        getCurrentFinalApprover: (policy) => policy?.connections?.gusto?.config?.finalApprover ?? null,
        getProviderName: () => translate('workspace.hr.gusto.title'),
        getHeaderTitle: () => translate('workspace.hr.finalApprover'),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateGustoFinalApprover(id, email, currentFinalApprover),
    };

    return (
        <HRFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default GustoFinalApproverPage;
