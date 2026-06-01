import React from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import {updateGustoApprovalMode} from '@libs/actions/connections/Gusto';
import {isGustoConnected} from '@libs/HRUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import HRApprovalModePageBase from '@pages/workspace/hr/HRApprovalModePageBase';
import type {HRApprovalModeProviderConfig} from '@pages/workspace/hr/HRApprovalModePageBase';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type GustoApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE>;

function GustoApprovalModePage({
    route: {
        params: {policyID},
    },
}: GustoApprovalModePageProps) {
    const {translate} = useLocalize();

    const config: HRApprovalModeProviderConfig<ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>> = {
        testID: 'GustoApprovalModePage',
        isConnected: isGustoConnected,
        approvalModes: CONST.GUSTO.APPROVAL_MODE,
        getCurrentApprovalMode: (policy) => policy?.connections?.gusto?.config?.approvalMode ?? null,
        getProviderName: () => translate('workspace.hr.gusto.title'),
        getHeaderTitle: () => translate('workspace.hr.approvalMode'),
        handleSave: ({draftApprovalMode, currentApprovalMode, connectionSyncProgress}) => updateGustoApprovalMode(policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress),
    };

    return (
        <HRApprovalModePageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default GustoApprovalModePage;
