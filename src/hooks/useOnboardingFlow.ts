import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@libs/onboardingSelectors';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
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
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});
    const [onboardingValues, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        canBeMissing: true,
    });

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const startedOnboardingFlowRef = useRef(false);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: tryNewDotOnyxSelector,
        canBeMissing: true,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY, {canBeMissing: true});

    useEffect(() => {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes
        InteractionManager.runAfterInteractions(() => {
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
    ]);

    // Always return that onboarding is completed to skip any onboarding-related UI
    return {isOnboardingCompleted: true, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlowRouter;
