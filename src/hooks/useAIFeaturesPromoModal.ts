import {isActingAsDelegateSelector} from '@selectors/Account';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

let hasRedirectedToAIFeaturesPromoModal = false;
let observedActiveMigrationModalThisSession = false;
let observedActiveOnboardingThisSession = false;

/**
 * Hook that navigates to the AI features promo modal if:
 * - The user is not acting as a delegate; and
 * - The user has not dismissed the AI features promo modal; and
 * - The user has seen neither the migrated user welcome modal nor the onboarding modal in this session
 */
function useAIFeaturesPromoModal(session: OnyxEntry<Session>) {
    const [isLoadingApp = true, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector});
    const [onboarding, onboardingMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING);

    const isWaitingForProtectedRoutes = useRef(false);

    const hasBeenAddedToNudgeMigration = tryNewDot?.hasBeenAddedToNudgeMigration ?? false;
    const isMigrationModalDismissed = isProductTrainingElementDismissed(CONST.MIGRATED_USER_WELCOME_MODAL, dismissedProductTraining);
    const isAIPromoModalDismissed = isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, dismissedProductTraining);
    const isMigrationModalPending = hasBeenAddedToNudgeMigration && !isMigrationModalDismissed;
    const hasCompletedOnboarding = hasCompletedGuidedSetupFlowSelector(onboarding);

    useEffect(() => {
        if (isAIPromoModalDismissed) {
            hasRedirectedToAIFeaturesPromoModal = false;
        }
    }, [isAIPromoModalDismissed]);

    useEffect(() => {
        if (isMigrationModalPending) {
            observedActiveMigrationModalThisSession = true;
        }
    }, [isMigrationModalPending]);

    useEffect(() => {
        if (hasCompletedOnboarding === false) {
            observedActiveOnboardingThisSession = true;
        }
    }, [hasCompletedOnboarding]);

    const isAllOnyxLoaded = !isLoadingOnyxValue(isLoadingAppMetadata, dismissedProductTrainingMetadata, tryNewDotMetadata, onboardingMetadata);

    const isEligible =
        isAllOnyxLoaded &&
        !!session?.authToken &&
        !isLoadingApp &&
        !isActingAsDelegate &&
        !hasRedirectedToAIFeaturesPromoModal &&
        !isAIPromoModalDismissed &&
        !isMigrationModalPending &&
        !observedActiveMigrationModalThisSession &&
        !observedActiveOnboardingThisSession;

    useEffect(() => {
        if (!isEligible || isWaitingForProtectedRoutes.current) {
            return;
        }
        isWaitingForProtectedRoutes.current = true;
        // Defer until any in-flight navigation transition (splash → home, etc.) has fully settled
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                Navigation.waitForProtectedRoutes().then(() => {
                    isWaitingForProtectedRoutes.current = false;
                    if (hasRedirectedToAIFeaturesPromoModal || observedActiveMigrationModalThisSession || observedActiveOnboardingThisSession || isAIPromoModalDismissed) {
                        return;
                    }
                    Log.info('[useAIFeaturesPromoModal] Navigating to AI features promo modal');
                    hasRedirectedToAIFeaturesPromoModal = true;
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AI_FEATURES_PROMO.path, Navigation.getActiveRoute() || ROUTES.HOME));
                });
            },
            waitForUpcomingTransition: true,
        });

        return () => {
            handle.cancel();
            isWaitingForProtectedRoutes.current = false;
        };
    }, [isEligible, isAIPromoModalDismissed]);
}

export default useAIFeaturesPromoModal;
