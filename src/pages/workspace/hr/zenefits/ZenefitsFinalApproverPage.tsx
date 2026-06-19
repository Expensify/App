import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {updateZenefitsFinalApprover} from '@libs/actions/connections/Zenefits';
import {isZenefitsConnected} from '@libs/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import HRFinalApproverPageBase from '@pages/workspace/hr/HRFinalApproverPageBase';
import type {HRFinalApproverProviderConfig} from '@pages/workspace/hr/HRFinalApproverPageBase';
import type SCREENS from '@src/SCREENS';

type ZenefitsFinalApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_ZENEFITS_FINAL_APPROVER>;

function ZenefitsFinalApproverPage({
    route: {
        params: {policyID},
    },
}: ZenefitsFinalApproverPageProps) {
    const {translate} = useLocalize();

    const config: HRFinalApproverProviderConfig = {
        testID: 'ZenefitsFinalApproverPage',
        isConnected: isZenefitsConnected,
        getCurrentFinalApprover: (policy) => policy?.connections?.zenefits?.config?.finalApprover ?? null,
        getProviderName: () => translate('workspace.hr.zenefits.title'),
        getHeaderTitle: () => translate('workspace.hr.finalApprover'),
        handleSave: ({policyID: id, email, currentFinalApprover}) => updateZenefitsFinalApprover(id, email, currentFinalApprover),
    };

    return (
        <HRFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default ZenefitsFinalApproverPage;
