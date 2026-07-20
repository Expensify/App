import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';

import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, getProductMarketingAnnouncementVariant} from '@libs/ProductMarketingWindowUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {isProductMarketingWindowCoveredSelector} from '@src/selectors/Modal';
import {activeAdminPoliciesSelector} from '@src/selectors/Policy';
import type {Policy, Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React from 'react';

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
    const login = useCurrentUserPersonalDetails().login ?? '';
    // Subscribe directly so both the eligible workspaces and their loading state are available. The CTA uses
    // the active/default admin workspace when possible and otherwise falls back to the first eligible workspace.
    const [activeAdminPolicies, activeAdminPoliciesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login),
    });
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    // Semantically covering overlays take precedence over the marketing window from pre-show through final hide.
    // Responsive popover sheets and route-backed right-docked navigation remain exempt.
    const [isModalCovering = false] = useOnyx(ONYXKEYS.MODAL, {
        selector: isProductMarketingWindowCoveredSelector,
    });
    // Anonymous sessions (logged-out visitors of public rooms) should never see product marketing.
    const [isAnonymousSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});
    // Copilots must not see (or permanently dismiss) the account owner's announcement.
    const [isActingAsDelegate = false, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [lastDismissedMarketingWindow, lastDismissedMarketingWindowMetadata] = useOnyx(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW);
    // On a fresh sign-in the cache reads above resolve instantly with empty values, so also wait for the OpenApp
    // response (which delivers the dismissal NVP and policies) before showing anything. Defaults to true so a
    // never-written key on a brand-new session is treated as still loading, mirroring useAIFeaturesPromoModal.
    const [isLoadingApp = true, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
    // Every illustration-backed variant is resolved up front because useMemoizedLazyIllustrations doesn't reload
    // assets when the requested names change after mount (e.g. when the audience flips after policies arrive).
    const illustrationNames = announcement ? [announcement.admin.visual, announcement.member?.visual].flatMap((visual) => (visual?.type === 'illustration' ? [visual.name] : [])) : [];
    const illustrations = useMemoizedLazyIllustrations(illustrationNames);
    const targetAdminPolicyID = activeAdminPolicies?.find((policy) => policy.id === activePolicyID)?.id ?? activeAdminPolicies?.at(0)?.id;
    const variant = getProductMarketingAnnouncementVariant(announcement, !!targetAdminPolicyID, lastDismissedMarketingWindow);
    const isCoveredByCenteredModalScreen = !!topmostRouteName && CENTERED_MODAL_SCREEN_NAVIGATORS.has(topmostRouteName);
    // Wait for the dismissal NVP and workspace targeting data to load before showing anything, otherwise a
    // dismissed window could flash on cold start or the CTA could briefly target the wrong workspace.
    const isLoading = isLoadingOnyxValue(lastDismissedMarketingWindowMetadata, activeAdminPoliciesMetadata, activePolicyIDMetadata, isLoadingAppMetadata, accountMetadata) || isLoadingApp;

    if (!announcement || !variant || isLoading || isModalCovering || isAnonymousSession || isActingAsDelegate || isCoveredByCenteredModalScreen) {
        return null;
    }

    const persistDismissal = () => {
        setNameValuePair(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, announcement.updateKey, lastDismissedMarketingWindow ?? '');
    };

    const dismiss = () => {
        persistDismissal();
    };

    const completeCta = () => {
        // Record the dismissal before navigating so the window doesn't flash again during navigation.
        persistDismissal();
        Navigation.navigate(variant.getCtaRoute(targetAdminPolicyID));
    };

    return (
        <ProductMarketingWindow
            variant={variant}
            illustration={variant.visual.type === 'illustration' ? illustrations[variant.visual.name] : undefined}
            onCtaPress={completeCta}
            onDismiss={dismiss}
        />
    );
}

ProductMarketingWindowManager.displayName = 'ProductMarketingWindowManager';

export default ProductMarketingWindowManager;
