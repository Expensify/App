import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {bulkUpgradeToCorporate} from '@libs/actions/Policy/Policy';
import {FEATURE_ROWS, getCollectTargetsToUpgrade, getControlOnlySelectedParts} from '@libs/CopyPolicySettingsUtils';
import {formatList} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntroView from '@pages/workspace/upgrade/UpgradeIntroView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

function CopyPolicySettingsUpgradePage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.UPGRADE>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useMemoizedLazyIllustrations(['ShieldYellow']);

    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettingsState, copyPolicySettingsMetadata] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettingsState?.targetPolicyIDs ?? [];
    const parts = copyPolicySettingsState?.parts ?? [];

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]);
    const policiesToUpgrade = getCollectTargetsToUpgrade(targetPolicies, parts);

    // Don't trust an "all targets are Corporate" reading until both Onyx keys have loaded and every
    // target policy has actually resolved. Otherwise unresolved targets look like `undefined` (not
    // Collect), policiesToUpgrade collapses to 0, and the redirect below skips a required upgrade.
    const areAllTargetPoliciesResolved = targetPolicies.every((policy) => !!policy);
    const isDataLoaded = !isLoadingOnyxValue(copyPolicySettingsMetadata, policiesMetadata) && areAllTargetPoliciesResolved;

    const controlOnlyFeatures = formatList(
        getControlOnlySelectedParts(targetPolicies, parts)
            .map((part) => {
                const labelKey = FEATURE_ROWS.find((row) => row.part === part)?.labelKey;
                return labelKey ? translate(labelKey) : undefined;
            })
            .filter((label): label is string => label !== undefined),
    );

    // Track that the user requested the upgrade and remember the names captured at request time (the
    // targets flip to Corporate optimistically, emptying policiesToUpgrade, so we can't read them later).
    const [hasRequestedUpgrade, setHasRequestedUpgrade] = useState(false);
    const [upgradedWorkspacesName, setUpgradedWorkspacesName] = useState('');
    const [pendingControlOnlyFeatures, setPendingControlOnlyFeatures] = useState('');

    // The bulk upgrade is in flight while any requested target still has isPendingUpgrade set.
    const isUpgradePending = targetPolicies.some((policy) => policy?.isPendingUpgrade);

    // Only show the success view once the requested upgrade settled successfully: no upgrade is pending
    // and none of the targets are Collect anymore. On failure the targets revert to Collect, so
    // policiesToUpgrade becomes non-empty again and the intro stays visible for a retry.
    const showSuccess = hasRequestedUpgrade && !isUpgradePending && policiesToUpgrade.length === 0;

    // Optimistic upgrade clears Collect targets, so live controlOnlyFeatures goes empty while pending.
    const displayedControlOnlyFeatures = isUpgradePending && pendingControlOnlyFeatures ? pendingControlOnlyFeatures : controlOnlyFeatures;

    // The upgrade step only exists when Control-only settings target a Collect workspace. If the user
    // lands here without that condition (e.g. back navigation after upgrading), skip to Confirm. We
    // never auto-redirect once an upgrade has been requested - the success view drives navigation then.
    useEffect(() => {
        if (!sourcePolicyID || !isDataLoaded || hasRequestedUpgrade || policiesToUpgrade.length > 0) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID));
    }, [isDataLoaded, hasRequestedUpgrade, policiesToUpgrade.length, sourcePolicyID]);

    const onUpgrade = () => {
        if (!sourcePolicyID || policiesToUpgrade.length === 0) {
            return;
        }
        setUpgradedWorkspacesName(formatList(policiesToUpgrade.map((policy) => policy.name)));
        setPendingControlOnlyFeatures(controlOnlyFeatures);
        bulkUpgradeToCorporate(policiesToUpgrade);
        setHasRequestedUpgrade(true);
    };

    const navigateToConfirm = () => {
        if (!sourcePolicyID) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={sourcePolicyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={CopyPolicySettingsUpgradePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.upgrade')}
                    shouldShowBackButton={!showSuccess}
                    onBackButtonPress={() => Navigation.goBack(sourcePolicyID ? ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID) : undefined)}
                />
                {showSuccess ? (
                    <UpgradeConfirmation
                        policyName={upgradedWorkspacesName}
                        afterUpgradeAcknowledged={navigateToConfirm}
                        buttonText={translate('common.continue')}
                    />
                ) : (
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <UpgradeIntroView
                            iconSrc={illustrations.ShieldYellow}
                            isIllustration
                            title={translate('workspace.copyPolicySettings.upgrade.title')}
                            description={translate('workspace.copyPolicySettings.upgrade.description', {workspaceName: sourcePolicy?.name ?? '', features: displayedControlOnlyFeatures})}
                            buttonText={translate('common.upgrade')}
                            onUpgrade={onUpgrade}
                            buttonDisabled={isOffline || policiesToUpgrade.length === 0}
                            loading={isUpgradePending}
                            unlockBadgeText={translate('workspace.upgrade.unlockFeatures')}
                        />
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsUpgradePage.displayName = 'CopyPolicySettingsUpgradePage';

export default CopyPolicySettingsUpgradePage;
