import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';

import {dismissMarketingWindow} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, getProductMarketingAnnouncementVariant} from '@libs/ProductMarketingWindowUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import {activeAdminPoliciesSelector} from '@src/selectors/Policy';
import {accountIDSelector} from '@src/selectors/Session';
import type {Policy, Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useNavigation} from '@react-navigation/core';
import React, {useState} from 'react';

import ProductMarketingWindow from './ProductMarketingWindow';

const isAnonymousSessionSelector = (session: OnyxEntry<Session>) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

// Root-stack navigators that present centered modals as screens. They never write ONYXKEYS.MODAL (only
// react-native-modal based modals do, via BaseModal), so the window checks the topmost root route to keep
// the "centered modal always takes precedence" guarantee for them as well.
const CENTERED_MODAL_SCREEN_NAVIGATORS = new Set<string>([
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR,
    NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR,
    NAVIGATORS.AI_FEATURES_PROMO_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_DRIVE_DEMO_NAVIGATOR,
    NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR,
]);

type ProductMarketingWindowManagerProps = {
    /** Name of the topmost root navigator route, used to hide the window under screen-based centered modals. */
    topmostRouteName?: string;
};

/**
 * Decides whether the persistent bottom-right product marketing window should be shown and with which content.
 * Mounted in the authenticated root navigator's extra content so it stays mounted across route changes.
 */
function ProductMarketingWindowManager({topmostRouteName}: ProductMarketingWindowManagerProps) {
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    // Only the ID is selected out of the policy collection: returning the admin policies themselves makes
    // useOnyx deep-compare every policy object on each collection update, which costs tens of ms on large accounts.
    const [targetAdminPolicyID, targetAdminPolicyIDMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => {
            const activeAdminPolicies = activeAdminPoliciesSelector(policies, currentUserLogin);
            return (activeAdminPolicies.find((policy) => policy.id === activePolicyID) ?? activeAdminPolicies.at(0))?.id;
        },
    });
    const [targetAdminPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(targetAdminPolicyID)}`);
    // Semantically covering overlays take precedence over the marketing window from pre-show through final hide.
    // Responsive popover sheets and route-backed right-docked navigation remain exempt.
    const [isProductMarketingWindowCovered = false] = useOnyx(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED);
    const [isAnonymousSession = false] = useOnyx(ONYXKEYS.SESSION, {
        selector: isAnonymousSessionSelector,
    });
    const [currentAccountID, currentAccountIDMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isActingAsDelegate = false, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [lastDismissedMarketingWindow, lastDismissedMarketingWindowMetadata] = useOnyx(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW);
    const [hasCompletedGuidedSetupFlow, onboardingMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [accountIDsWithObservedActiveOnboarding, setAccountIDsWithObservedActiveOnboarding] = useState<ReadonlySet<number>>(() => new Set());
    // OpenApp provides the dismissal and targeting data; wait for it to avoid a startup flash or a wrong CTA destination.
    const [isLoadingApp = true, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const isLoadingOnboardingContext = isLoadingOnyxValue(currentAccountIDMetadata, accountMetadata, onboardingMetadata, isLoadingAppMetadata);
    const shouldRecordActiveOnboarding = !isLoadingOnboardingContext && !isLoadingApp && !isActingAsDelegate && currentAccountID !== undefined && hasCompletedGuidedSetupFlow === false;
    // Record during render so onboarding completion cannot overtake an effect, and scope the latch by account because
    // account and delegate transitions can preserve this mounted manager while their Onyx state is rehydrating.
    if (shouldRecordActiveOnboarding && !accountIDsWithObservedActiveOnboarding.has(currentAccountID)) {
        setAccountIDsWithObservedActiveOnboarding((accountIDs) => new Set(accountIDs).add(currentAccountID));
    }

    const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
    // Every illustration-backed variant is resolved up front because useMemoizedLazyIllustrations doesn't reload
    // assets when the requested names change after mount (e.g. when the audience flips after policies arrive).
    const illustrationNames = announcement ? [announcement.admin.visual, announcement.member?.visual].flatMap((visual) => (visual?.type === 'illustration' ? [visual.name] : [])) : [];
    const illustrations = useMemoizedLazyIllustrations(illustrationNames);
    const variant = getProductMarketingAnnouncementVariant(announcement, !!targetAdminPolicyID, lastDismissedMarketingWindow);
    const isMemberVariantUnavailable = variant === announcement?.member && !isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const shouldPrefetchTargetPolicyConnections = isVendorMatchingBetaEnabled && !!targetAdminPolicyID && targetAdminPolicyID !== activePolicyID;
    const {isFetchNeeded, isLoadingFetchedFlag, hasBeenFetched} = usePolicyConnectionsPrefetch(targetAdminPolicy, shouldPrefetchTargetPolicyConnections);
    const isAdminCtaPending = shouldPrefetchTargetPolicyConnections && (isLoadingFetchedFlag || (isFetchNeeded && hasBeenFetched === undefined));
    const isAdminPolicyConnectionDataAvailable = !shouldPrefetchTargetPolicyConnections || hasBeenFetched === true;
    const isCoveredByCenteredModalScreen = !!topmostRouteName && CENTERED_MODAL_SCREEN_NAVIGATORS.has(topmostRouteName);
    const isLoading =
        isLoadingOnyxValue(
            lastDismissedMarketingWindowMetadata,
            targetAdminPolicyIDMetadata,
            activePolicyIDMetadata,
            isLoadingAppMetadata,
            currentAccountIDMetadata,
            accountMetadata,
            onboardingMetadata,
        ) || isLoadingApp;
    const shouldSuppressForOnboardingSession = hasCompletedGuidedSetupFlow === false || (currentAccountID !== undefined && accountIDsWithObservedActiveOnboarding.has(currentAccountID));
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();
    const navigation = useNavigation();
    const isIn2FASetupFlow = useRootNavigationState((state) => {
        // When navigation is not ready yet, use the navigation state from the navigation hook.
        const focusedScreen = getDeepestFocusedScreen(state ?? navigation.getState());
        return isTwoFactorSetupScreen(focusedScreen?.name);
    });

    if (
        !announcement ||
        !variant ||
        isMemberVariantUnavailable ||
        isLoading ||
        isProductMarketingWindowCovered ||
        isAnonymousSession ||
        isActingAsDelegate ||
        shouldSuppressForOnboardingSession ||
        isCoveredByCenteredModalScreen ||
        shouldShowRequire2FAPage ||
        isIn2FASetupFlow
    ) {
        return null;
    }

    const persistDismissal = () => {
        dismissMarketingWindow(announcement.updateKey);
    };

    const dismiss = () => {
        persistDismissal();
    };

    const completeCta = () => {
        if (isAdminCtaPending) {
            return;
        }
        // Record the dismissal before navigating so the window doesn't flash again during navigation.
        persistDismissal();
        Navigation.navigate(
            variant.getCtaRoute({
                adminPolicy: targetAdminPolicy,
                isVendorMatchingBetaEnabled,
                isAdminPolicyConnectionDataAvailable,
            }),
        );
    };

    return (
        <ProductMarketingWindow
            variant={variant}
            illustration={variant.visual.type === 'illustration' ? illustrations[variant.visual.name] : undefined}
            isCtaDisabled={isAdminCtaPending}
            onCtaPress={completeCta}
            onDismiss={dismiss}
        />
    );
}

ProductMarketingWindowManager.displayName = 'ProductMarketingWindowManager';

export default ProductMarketingWindowManager;
