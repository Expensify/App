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
import {isModalCoveringSelector} from '@src/selectors/Modal';
import {hasActiveAdminPoliciesSelector} from '@src/selectors/Policy';
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
    // Same audience resolution as useHasActiveAdminPolicies, subscribed directly so the loading state is
    // available: without it, admins would briefly see the member variant while policies are still loading.
    const [hasActiveAdminPolicies, hasActiveAdminPoliciesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => hasActiveAdminPoliciesSelector(policies, login),
    });
    // The centered modal always takes precedence over the marketing window, so the window is hidden while
    // a covering (non-popover) modal is opening or visible and shows again once the modal state clears.
    const [isModalCovering = false] = useOnyx(ONYXKEYS.MODAL, {selector: isModalCoveringSelector});
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
    // Both variants' illustrations are resolved here with a fixed name list because useMemoizedLazyIllustrations
    // doesn't reload assets when the requested names change after mount (e.g. when the audience flips to admin
    // as soon as policies arrive for a first-time sign-in).
    const illustrationNames = announcement ? [announcement.admin.illustration, announcement.member.illustration] : [];
    const illustrations = useMemoizedLazyIllustrations(illustrationNames);
    const variant = getProductMarketingAnnouncementVariant(announcement, !!hasActiveAdminPolicies, lastDismissedMarketingWindow);
    const isCoveredByCenteredModalScreen = !!topmostRouteName && CENTERED_MODAL_SCREEN_NAVIGATORS.has(topmostRouteName);
    // Wait for the dismissal NVP and the policy collection to load before showing anything, otherwise a
    // dismissed window would flash on cold start and admins would flash the member variant.
    const isLoading = isLoadingOnyxValue(lastDismissedMarketingWindowMetadata, hasActiveAdminPoliciesMetadata, isLoadingAppMetadata, accountMetadata) || isLoadingApp;

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
        Navigation.navigate(variant.getCtaRoute());
    };

    return (
        <ProductMarketingWindow
            variant={variant}
            illustration={illustrations[variant.illustration]}
            onCtaPress={completeCta}
            onDismiss={dismiss}
        />
    );
}

ProductMarketingWindowManager.displayName = 'ProductMarketingWindowManager';

export default ProductMarketingWindowManager;
