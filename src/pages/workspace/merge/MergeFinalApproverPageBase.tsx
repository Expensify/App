import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';

import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';

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
    handleSave: (params: {policyID: string; email: string; currentFinalApprover: string | null}) => void;
};

type MergeFinalApproverPageBaseProps = {
    policyID: string;
    config: MergeFinalApproverProviderConfig;
};

function MergeFinalApproverPageBase({policyID, config}: MergeFinalApproverPageBaseProps) {
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
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
                <HeaderWithBackButtonAndTitle
                    title={config.getHeaderTitle(providerName)}
                    onBackButtonPress={() => Navigation.goBack(config.backRoute)}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={finalApprover ?? ''}
                    setApprover={(email) => {
                        config.handleSave({policyID, email, currentFinalApprover: finalApprover});
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(config.backRoute));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {MergeFinalApproverProviderConfig};
export default MergeFinalApproverPageBase;
