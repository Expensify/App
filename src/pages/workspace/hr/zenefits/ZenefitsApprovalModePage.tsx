import React from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import {updateZenefitsApprovalMode} from '@libs/actions/connections/Zenefits';
import {isZenefitsConnected} from '@libs/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import HRApprovalModePageBase from '@pages/workspace/hr/HRApprovalModePageBase';
import type {HRApprovalModeProviderConfig} from '@pages/workspace/hr/HRApprovalModePageBase';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ZenefitsApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_ZENEFITS_APPROVAL_MODE>;

function ZenefitsApprovalModePage({
    route: {
        params: {policyID},
    },
}: ZenefitsApprovalModePageProps) {
    const {translate} = useLocalize();

    const config: HRApprovalModeProviderConfig<ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>> = {
        testID: 'ZenefitsApprovalModePage',
        beta: CONST.BETAS.ZENEFITS,
        isConnected: isZenefitsConnected,
        approvalModes: CONST.ZENEFITS.APPROVAL_MODE,
        getCurrentApprovalMode: (policy) => policy?.connections?.zenefits?.config?.approvalMode ?? null,
        getProviderName: () => translate('workspace.hr.zenefits.title'),
        getHeaderTitle: () => translate('workspace.hr.approvalMode'),
        handleSave: ({draftApprovalMode, currentApprovalMode, connectionSyncProgress}) =>
            updateZenefitsApprovalMode(policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress),
    };

    return (
        <HRApprovalModePageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default ZenefitsApprovalModePage;
