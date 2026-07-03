import {isActingAsDelegateSelector} from '@selectors/Account';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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
    const [isActingAsDelegate, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
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
        if (!isAIPromoModalDismissed) {
            return;
        }
        hasRedirectedToAIFeaturesPromoModal = false;
    }, [isAIPromoModalDismissed]);

    useEffect(() => {
        if (!isMigrationModalPending) {
            return;
        }
        observedActiveMigrationModalThisSession = true;
    }, [isMigrationModalPending]);

    useEffect(() => {
        if (hasCompletedOnboarding !== false) {
            return;
        }
        observedActiveOnboardingThisSession = true;
    }, [hasCompletedOnboarding]);

    const isAllOnyxLoaded = !isLoadingOnyxValue(isLoadingAppMetadata, accountMetadata, dismissedProductTrainingMetadata, tryNewDotMetadata, onboardingMetadata);

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
                    const lastRoute = navigationRef.getRootState?.()?.routes.at(-1)?.name;
                    if (lastRoute === NAVIGATORS.SHARE_MODAL_NAVIGATOR || lastRoute === SCREENS.NOT_FOUND) {
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
