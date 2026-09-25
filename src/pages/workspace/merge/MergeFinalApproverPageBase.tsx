import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type {PolicyConnectionSyncProgress, PolicyFeatureName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type MergeFinalApproverProviderConfig = {
    testID: string;
    featureName: PolicyFeatureName;
    backRoute: Route;
    shouldBeBlocked?: boolean;
    isConnected: (policy: OnyxEntry<Policy>) => boolean;
    getCurrentFinalApprover: (policy: OnyxEntry<Policy>) => string | null;
    getHeaderTitle: (providerName: string) => string;
    getProviderName: (policy: OnyxEntry<Policy>) => string;
    handleSave: (params: {policyID: string; email: string; currentFinalApprover: string | null; connectionSyncProgress?: OnyxEntry<PolicyConnectionSyncProgress>}) => void;
};

type MergeFinalApproverPageBaseProps = {
    policyID: string;
    config: MergeFinalApproverProviderConfig;
};

function MergeFinalApproverPageBase({policyID, config}: MergeFinalApproverPageBaseProps) {
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const finalApprover = config.getCurrentFinalApprover(policy);
    const providerName = config.getProviderName(policy);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={config.featureName}
            shouldBeBlocked={!!config.shouldBeBlocked || (!!policy && !config.isConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={config.testID}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={config.getHeaderTitle(providerName)}
                    onBackButtonPress={() => Navigation.goBack(config.backRoute)}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={finalApprover ?? ''}
                    setApprover={(email) => {
                        config.handleSave({policyID, email, currentFinalApprover: finalApprover, connectionSyncProgress});
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(config.backRoute));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {MergeFinalApproverProviderConfig};
export default MergeFinalApproverPageBase;
