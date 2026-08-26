import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePolicies, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {appendParam, getSearchParamFromPath} from '@libs/Url';

import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function DynamicTravelUpgrade() {
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_UPGRADE.path);
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.travel;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const groupPaidPolicies = getActivePolicies(policies, currentUserLogin).filter(isPaidGroupPolicy);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const policyIDInBackPath = getSearchParamFromPath(backPath, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);
    const policyInBackPath = usePolicy(policyIDInBackPath ?? undefined);

    const isUpgraded = groupPaidPolicies.length > 0;

    // Creating a workspace makes it the default one, so the personal workspace the entry screen was opened with is
    // stale by the time we return. POP_TO (compareParams: false) is the only back action that rewrites params in place.
    const backPathWithDefaultPolicy =
        activePolicyID && policyIDInBackPath !== activePolicyID && policyInBackPath?.type === CONST.POLICY.TYPE.PERSONAL
            ? appendParam(backPath, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, activePolicyID)
            : undefined;

    const goBackToEntryScreen = (fallbackRoute?: Route) => {
        if (backPathWithDefaultPolicy) {
            Navigation.goBack(backPathWithDefaultPolicy, {compareParams: false});
            return;
        }

        Navigation.goBack(fallbackRoute);
    };

    const openWorkspaceConfirmation = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_WORKSPACE_CONFIRMATION.path));
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="TravelUpgrade"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen={!isUpgraded}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => goBackToEntryScreen(backPath)}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {isUpgraded ? (
                    <UpgradeConfirmation
                        afterUpgradeAcknowledged={() => goBackToEntryScreen()}
                        policyName=""
                        isTravelUpgrade
                    />
                ) : (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={openWorkspaceConfirmation}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default DynamicTravelUpgrade;
