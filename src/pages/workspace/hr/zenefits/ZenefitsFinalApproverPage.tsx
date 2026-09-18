import useLocalize from '@hooks/useLocalize';

import {updateZenefitsFinalApprover} from '@libs/actions/connections/Zenefits';
import {isZenefitsConnected} from '@libs/merge/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import MergeFinalApproverPageBase from '@pages/workspace/hr/MergeFinalApproverPageBase';
import type {MergeFinalApproverProviderConfig} from '@pages/workspace/hr/MergeFinalApproverPageBase';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ZenefitsFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_ZENEFITS_FINAL_APPROVER>;

function ZenefitsFinalApproverPage({
    route: {
        params: {policyID},
    },
}: ZenefitsFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: MergeFinalApproverProviderConfig = {
        testID: 'ZenefitsFinalApproverPage',
        isConnected: isZenefitsConnected,
        featureName: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        backRoute: ROUTES.WORKSPACE_HR.getRoute(policyID),
        getCurrentFinalApprover: (policy) => policy?.connections?.zenefits?.config?.finalApprover ?? null,
        getProviderName: () => translate('workspace.hr.zenefits.title'),
        getHeaderTitle: () => translate('workspace.merge.finalApprover'),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateZenefitsFinalApprover(id, email, currentFinalApprover),
    };

    return (
        <MergeFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default ZenefitsFinalApproverPage;
