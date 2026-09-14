import useLocalize from '@hooks/useLocalize';

import {updateGustoFinalApprover} from '@libs/actions/connections/Gusto';
import {isGustoConnected} from '@libs/merge/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import MergeFinalApproverPageBase from '@pages/workspace/hr/MergeFinalApproverPageBase';
import type {MergeFinalApproverProviderConfig} from '@pages/workspace/hr/MergeFinalApproverPageBase';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type GustoFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_FINAL_APPROVER>;

function GustoFinalApproverPage({
    route: {
        params: {policyID},
    },
}: GustoFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: MergeFinalApproverProviderConfig = {
        testID: 'GustoFinalApproverPage',
        isConnected: isGustoConnected,
        featureName: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        backRoute: ROUTES.WORKSPACE_HR.getRoute(policyID),
        getCurrentFinalApprover: (policy) => policy?.connections?.gusto?.config?.finalApprover ?? null,
        getProviderName: () => translate('workspace.hr.gusto.title'),
        getHeaderTitle: () => translate('workspace.merge.finalApprover'),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateGustoFinalApprover(id, email, currentFinalApprover),
    };

    return (
        <MergeFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default GustoFinalApproverPage;
