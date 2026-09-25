import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';

import {dismissMarketingWindow} from '@libs/actions/User';
import {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import openExternalLink from '@libs/openExternalLink';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, isProductMarketingAnnouncementDismissed} from '@libs/ProductMarketingWindowUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import {accountIDSelector, isSupportalSessionSelector} from '@src/selectors/Session';
import type {Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

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
    // Semantically covering overlays take precedence over the marketing window from pre-show through final hide.
    // Responsive popover sheets and route-backed right-docked navigation remain exempt.
    const [isProductMarketingWindowCovered = false] = useOnyx(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED);
    const [isAnonymousSession = false] = useOnyx(ONYXKEYS.SESSION, {
        selector: isAnonymousSessionSelector,
    });
    const [currentAccountID, currentAccountIDMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isSupportalSession] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});
    const [stashedAccountID, stashedAccountIDMetadata] = useOnyx(ONYXKEYS.STASHED_SESSION, {selector: accountIDSelector});
    const [isActingAsDelegate = false, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [lastDismissedMarketingWindow, lastDismissedMarketingWindowMetadata] = useOnyx(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW);
    const [hasCompletedGuidedSetupFlow, onboardingMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [accountIDsWithObservedActiveOnboarding, setAccountIDsWithObservedActiveOnboarding] = useState<ReadonlySet<number>>(() => new Set());
    // OpenApp provides the dismissal data; wait for it to avoid a startup flash of an already-dismissed window.
    const [isLoadingApp = true, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    // The session changes before loading/delegate data during Copilot entry. A failed connection keeps the original account ID.
    // Supportal also stashes sessions, but its existing marketing eligibility should remain unchanged.
    const isSwitchingToDelegator = !isSupportalSession && stashedAccountID !== undefined && stashedAccountID !== currentAccountID;
    const isLoadingOnboardingContext = isLoadingOnyxValue(currentAccountIDMetadata, stashedAccountIDMetadata, accountMetadata, onboardingMetadata, isLoadingAppMetadata);
    const shouldRecordActiveOnboarding =
        !isLoadingOnboardingContext && !isLoadingApp && !isActingAsDelegate && !isSwitchingToDelegator && currentAccountID !== undefined && hasCompletedGuidedSetupFlow === false;
    if (shouldRecordActiveOnboarding && !accountIDsWithObservedActiveOnboarding.has(currentAccountID)) {
        setAccountIDsWithObservedActiveOnboarding((accountIDs) => new Set(accountIDs).add(currentAccountID));
    }

    const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
    const illustrationNames = announcement?.visual.type === 'illustration' ? [announcement.visual.name] : [];
    const illustrations = useMemoizedLazyIllustrations(illustrationNames);
    const isDismissed = isProductMarketingAnnouncementDismissed(announcement, lastDismissedMarketingWindow);
    const isCoveredByCenteredModalScreen = !!topmostRouteName && CENTERED_MODAL_SCREEN_NAVIGATORS.has(topmostRouteName);
    const isLoading =
        isLoadingOnyxValue(lastDismissedMarketingWindowMetadata, isLoadingAppMetadata, currentAccountIDMetadata, stashedAccountIDMetadata, accountMetadata, onboardingMetadata) ||
        isLoadingApp;
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
        isDismissed ||
        isLoading ||
        isProductMarketingWindowCovered ||
        isAnonymousSession ||
        isActingAsDelegate ||
        isSwitchingToDelegator ||
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
        // Record the dismissal before leaving so the window doesn't flash again while the new tab opens.
        persistDismissal();
        openExternalLink(announcement.ctaUrl);
    };

    return (
        <ProductMarketingWindow
            announcement={announcement}
            illustration={announcement.visual.type === 'illustration' ? illustrations[announcement.visual.name] : undefined}
            onCtaPress={completeCta}
            onDismiss={dismiss}
        />
    );
}

ProductMarketingWindowManager.displayName = 'ProductMarketingWindowManager';

export default ProductMarketingWindowManager;
