import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@libs/onboardingSelectors';
import Permissions from '@libs/Permissions';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    const [isOnboardingCompleted, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [tryNewDot, tryNewDotdMetadata] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {
        selector: tryNewDotOnyxSelector,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY);
    const [allBetas, allBetasMetadata] = useOnyx(ONYXKEYS.BETAS);
    useEffect(() => {
        if (isLoadingOnyxValue(isOnboardingCompletedMetadata, tryNewDotdMetadata, dismissedProductTrainingMetadata, allBetasMetadata)) {
            return;
        }

        if (NativeModules.HybridAppModule && isLoadingOnyxValue(isSingleNewDotEntryMetadata)) {
            return;
        }

        if (hasBeenAddedToNudgeMigration && !dismissedProductTraining?.migratedUserWelcomeModal && Permissions.shouldShowProductTrainingElements(allBetas)) {
            Navigation.navigate(ROUTES.MIGRATED_USER_WELCOME_MODAL);
            return;
        }

        if (NativeModules.HybridAppModule) {
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
                OnboardingFlow.startOnboardingFlow();
            }
        }

        // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
        if (!NativeModules.HybridAppModule && isOnboardingCompleted === false) {
            OnboardingFlow.startOnboardingFlow();
        }
    }, [
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
        allBetasMetadata,
        allBetas,
    ]);

    return {isOnboardingCompleted, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlowRouter;
