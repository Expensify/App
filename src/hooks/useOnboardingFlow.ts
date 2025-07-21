import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@libs/onboardingSelectors';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isLoggingInAsNewUser} from '@libs/SessionUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    const currentUrl = getCurrentUrl();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [onboardingValues, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        canBeMissing: true,
    });

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: (session) => session?.email});
    const isLoggingInAsNewSessionUser = isLoggingInAsNewUser(currentUrl, sessionEmail);
    const startedOnboardingFlowRef = useRef(false);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: tryNewDotOnyxSelector,
        canBeMissing: true,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: (hybridApp) => hybridApp?.isSingleNewDotEntry, canBeMissing: true});

    useEffect(() => {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes
        InteractionManager.runAfterInteractions(() => {
            // Prevent starting the onboarding flow if we are logging in as a new user with short lived token
            if (currentUrl?.includes(ROUTES.TRANSITION_BETWEEN_APPS) && isLoggingInAsNewSessionUser) {
                return;
            }
            if (isLoadingApp !== false) {
                return;
            }

            if (isLoadingOnyxValue(isOnboardingCompletedMetadata, tryNewDotMetadata, dismissedProductTrainingMetadata)) {
                return;
            }

            if (CONFIG.IS_HYBRID_APP && isLoadingOnyxValue(isSingleNewDotEntryMetadata)) {
                return;
            }
            if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining)) {
                const defaultCannedQuery = buildCannedSearchQuery();
                const query = defaultCannedQuery;
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
                Navigation.navigate(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute(true));
                return;
            }

            if (hasBeenAddedToNudgeMigration) {
                return;
            }

            const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboardingValues);

            if (CONFIG.IS_HYBRID_APP) {
                // For single entries, such as using the Travel feature from OldDot, we don't want to show onboarding
                if (isSingleNewDotEntry) {
                    return;
                }

                // When user is transitioning from OldDot to NewDot, we usually show the explanation modal
                if (isHybridAppOnboardingCompleted === false) {
                    Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT);
                }

                // But if the hybrid app onboarding is completed, but NewDot onboarding is not completed, we start NewDot onboarding flow
                // This is a special case when user created an account from NewDot without finishing the onboarding flow and then logged in from OldDot
                if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false && !startedOnboardingFlowRef.current) {
                    startedOnboardingFlowRef.current = true;
                    startOnboardingFlow({
                        onboardingValuesParam: onboardingValues,
                        isUserFromPublicDomain: !!account?.isFromPublicDomain,
                        hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                    });
                }
            }

            // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
            if (!CONFIG.IS_HYBRID_APP && isOnboardingCompleted === false && !startedOnboardingFlowRef.current) {
                startedOnboardingFlowRef.current = true;
                startOnboardingFlow({
                    onboardingValuesParam: onboardingValues,
                    isUserFromPublicDomain: !!account?.isFromPublicDomain,
                    hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                });
            }
        });
    }, [
        isLoadingApp,
        isHybridAppOnboardingCompleted,
        isOnboardingCompletedMetadata,
        tryNewDotMetadata,
        isSingleNewDotEntryMetadata,
        isSingleNewDotEntry,
        hasBeenAddedToNudgeMigration,
        dismissedProductTrainingMetadata,
        dismissedProductTraining?.migratedUserWelcomeModal,
        onboardingValues,
        dismissedProductTraining,
        account?.isFromPublicDomain,
        account?.hasAccessibleDomainPolicies,
        currentUrl,
        isLoggingInAsNewSessionUser,
    ]);

    return {isOnboardingCompleted: hasCompletedGuidedSetupFlowSelector(onboardingValues), isHybridAppOnboardingCompleted};
}

export default useOnboardingFlowRouter;
