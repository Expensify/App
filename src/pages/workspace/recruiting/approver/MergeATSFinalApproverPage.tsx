import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

import {isMergeConnected} from '@libs/merge/MergeUtils';
import {getConnectedATSProvider} from '@libs/merge/RecruitingUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeATSApprovalNavigatorParamList} from '@libs/Navigation/types';

import MergeFinalApproverPageBase from '@pages/workspace/merge/MergeFinalApproverPageBase';
import type {MergeFinalApproverProviderConfig} from '@pages/workspace/merge/MergeFinalApproverPageBase';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import {useMergeATSApprovalDraftActions, useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';

type MergeATSFinalApproverPageProps = PlatformStackScreenProps<MergeATSApprovalNavigatorParamList, typeof SCREENS.WORKSPACE.RECRUITING_MERGE_FINAL_APPROVER>;

function MergeATSFinalApproverPage({
    route: {
        params: {policyID},
    },
}: MergeATSFinalApproverPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {finalApprover} = useMergeATSApprovalDraftState(policyID);
    const {setDraftFinalApprover} = useMergeATSApprovalDraftActions();

    const config: MergeFinalApproverProviderConfig = {
        testID: 'MergeATSFinalApproverPage',
        isConnected: (policy) => isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS),
        featureName: CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED,
        backRoute: ROUTES.WORKSPACE_RECRUITING_MERGE_APPROVAL_MODE.getRoute(policyID),
        shouldBeBlocked: !isBetaEnabled(CONST.BETAS.MERGE_ATS),
        getCurrentFinalApprover: () => finalApprover ?? null,
        getProviderName: (policy) => getConnectedATSProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats,
        getHeaderTitle: () => translate('workspace.recruiting.finalApprover'),
        // The final approver is optional in advanced mode, so picking the selected one again clears it.
        handleSave: ({email}) => setDraftFinalApprover(email === finalApprover ? '' : email),
    };

    return (
        <MergeFinalApproverPageBase
            policyID={policyID}
            config={config}
        />
    );
}

export default MergeATSFinalApproverPage;
