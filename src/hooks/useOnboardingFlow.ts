import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {isUserOnPrivateDomain} from '@libs/actions/Session';
import {startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@libs/onboardingSelectors';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const [isOnboardingCompleted, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [tryNewDot, tryNewDotdMetadata] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {
        selector: tryNewDotOnyxSelector,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);

    const isPrivateDomain = isUserOnPrivateDomain();

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY);
    useEffect(() => {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes
        InteractionManager.runAfterInteractions(() => {
            if (isLoadingApp !== false) {
                return;
            }

            if (isLoadingOnyxValue(isOnboardingCompletedMetadata, tryNewDotdMetadata, dismissedProductTrainingMetadata)) {
                return;
            }

            if (CONFIG.IS_HYBRID_APP && isLoadingOnyxValue(isSingleNewDotEntryMetadata)) {
                return;
            }

            if (hasBeenAddedToNudgeMigration && !dismissedProductTraining?.migratedUserWelcomeModal) {
                const defaultCannedQuery = buildCannedSearchQuery();
                const query = defaultCannedQuery;
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
                Navigation.navigate(ROUTES.MIGRATED_USER_WELCOME_MODAL);
                return;
            }

            if (hasBeenAddedToNudgeMigration) {
                return;
            }

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
                if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false) {
                    startOnboardingFlow(isPrivateDomain);
                }
            }

            // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
            if (!CONFIG.IS_HYBRID_APP && isOnboardingCompleted === false) {
                startOnboardingFlow(isPrivateDomain);
            }
        });
    }, [
        isLoadingApp,
        isOnboardingCompleted,
        isHybridAppOnboardingCompleted,
        isOnboardingCompletedMetadata,
        tryNewDotdMetadata,
        isSingleNewDotEntryMetadata,
        isSingleNewDotEntry,
        hasBeenAddedToNudgeMigration,
        dismissedProductTrainingMetadata,
        dismissedProductTraining?.migratedUserWelcomeModal,
        dismissedProductTraining,
        isPrivateDomain,
    ]);

    return {isOnboardingCompleted, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlowRouter;
