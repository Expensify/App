import React from 'react';
import type {ValueOf} from 'type-fest';
import {updateGustoApprovalMode} from '@libs/actions/connections/Gusto';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isGustoConnected} from '@libs/PolicyUtils';
import HRApprovalModePageBase from '@pages/workspace/hr/HRApprovalModePageBase';
import type {HRApprovalModeProviderConfig} from '@pages/workspace/hr/HRApprovalModePageBase';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type GustoApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE>;

const gustoApprovalModeConfig: HRApprovalModeProviderConfig<ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>> = {
    testID: 'GustoApprovalModePage',
    beta: CONST.BETAS.GUSTO,
    isConnected: isGustoConnected,
    approvalModes: CONST.GUSTO.APPROVAL_MODE,
    getCurrentApprovalMode: (policy) => policy?.connections?.gusto?.config?.approvalMode ?? null,
    getProviderName: (_, translate) => translate('workspace.hr.gusto.title'),
    getHeaderTitle: (_, translate) => translate('workspace.hr.approvalMode'),
    onSave: ({policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress}) => updateGustoApprovalMode(policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress),
};

function GustoApprovalModePage({
    route: {
        params: {policyID},
    },
}: GustoApprovalModePageProps) {
    return (
        <HRApprovalModePageBase
            policyID={policyID}
            config={gustoApprovalModeConfig}
        />
    );
}

export default GustoApprovalModePage;
