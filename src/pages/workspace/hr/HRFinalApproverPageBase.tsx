import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Beta from '@src/types/onyx/Beta';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type HRFinalApproverProviderConfig = {
    testID: string;
    beta?: Beta;
    isConnected: (policy: OnyxEntry<Policy>) => boolean;
    getCurrentFinalApprover: (policy: OnyxEntry<Policy>) => string | null;
    getHeaderTitle: (providerName: string) => string;
    getProviderName: (policy: OnyxEntry<Policy>) => string;
    handleSave: (params: {policyID: string; email: string; currentFinalApprover: string | null; connectionSyncProgress?: OnyxEntry<PolicyConnectionSyncProgress>}) => void;
};

type HRFinalApproverPageBaseProps = {
    policyID: string;
    config: HRFinalApproverProviderConfig;
};

function HRFinalApproverPageBase({policyID, config}: HRFinalApproverPageBaseProps) {
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const finalApprover = config.getCurrentFinalApprover(policy);
    const providerName = config.getProviderName(policy);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={(!!config.beta && !isBetaEnabled(config.beta)) || (!!policy && !config.isConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={config.testID}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={config.getHeaderTitle(providerName)}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={finalApprover ?? ''}
                    setApprover={(email) => {
                        config.handleSave({policyID, email, currentFinalApprover: finalApprover, connectionSyncProgress});
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID)));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {HRFinalApproverProviderConfig};
export default HRFinalApproverPageBase;
