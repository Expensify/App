import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import {useEffect} from 'react';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isLoggingInAsNewUser} from '@libs/SessionUtils';
import {startOnboardingFlow} from '@userActions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    const currentUrl = getCurrentUrl();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [onboardingValues, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isLoggingInAsNewSessionUser = isLoggingInAsNewUser(currentUrl, sessionEmail);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: tryNewDotOnyxSelector,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};
    const isOnboardingLoading = isLoadingOnyxValue(isOnboardingCompletedMetadata, tryNewDotMetadata);

    const [, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);

    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingInitialPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH);
    const {isBetaEnabled} = usePermissions();
    const canUseSubmit2026 = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const [hasNonPersonalPolicy] = useOnyx(ONYXKEYS.HAS_NON_PERSONAL_POLICY);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const wasInvitedToNewDot = wasInvitedToNewDotSelector(introSelected);

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isSingleNewDotEntrySelector});

    const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboardingValues);

    useEffect(() => {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                // Prevent showing onboarding if we are logging in as a new user with short lived token
                if (currentUrl?.includes(ROUTES.TRANSITION_BETWEEN_APPS) && isLoggingInAsNewSessionUser) {
                    return;
                }

                if (isLoadingApp !== false || isOnboardingLoading) {
                    return;
                }

                if (isLoadingOnyxValue(isOnboardingCompletedMetadata, tryNewDotMetadata, dismissedProductTrainingMetadata)) {
                    return;
                }

                if (CONFIG.IS_HYBRID_APP && isLoadingOnyxValue(isSingleNewDotEntryMetadata)) {
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
                }

                const isMigratedUser = hasBeenAddedToNudgeMigration ?? false;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const isInvitedOrGroupMember = (hasNonPersonalPolicy || wasInvitedToNewDot) ?? false;
                if (isMigratedUser || isInvitedOrGroupMember) {
                    return;
                }

                // Explicitly start the onboarding flow when onboarding is not completed.
                // We use startOnboardingFlow (which calls resetRoot) instead of Navigation.navigate because
                // navigate goes through the router where OnboardingGuard would block the navigation.
                // waitForProtectedRoutes ensures navigation is ready, which is critical during fresh login.
                // Skip when HybridApp explanation modal is active (OldDot-transitioning users).
                if (isOnboardingCompleted === false && !(CONFIG.IS_HYBRID_APP && isHybridAppOnboardingCompleted === false)) {
                    Navigation.waitForProtectedRoutes().then(() => {
                        startOnboardingFlow({
                            onboardingValuesParam: onboardingValues ?? undefined,
                            isUserFromPublicDomain: !!account?.isFromPublicDomain,
                            hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                            currentOnboardingCompanySize: onboardingCompanySize,
                            currentOnboardingPurposeSelected: onboardingPurposeSelected,
                            onboardingInitialPath,
                            onboardingValues,
                            canUseSubmit2026,
                            isAccountValidated: !!account?.validated,
                        });
                    });
                }
            },
        });

        return () => {
            handle.cancel();
        };
    }, [
        isLoadingApp,
        isHybridAppOnboardingCompleted,
        isOnboardingCompletedMetadata,
        tryNewDotMetadata,
        isSingleNewDotEntryMetadata,
        isSingleNewDotEntry,
        dismissedProductTrainingMetadata,
        currentUrl,
        isLoggingInAsNewSessionUser,
        isOnboardingLoading,
        onboardingValues,
        account?.isFromPublicDomain,
        account?.hasAccessibleDomainPolicies,
        account?.validated,
        onboardingCompanySize,
        onboardingPurposeSelected,
        onboardingInitialPath,
        hasBeenAddedToNudgeMigration,
        hasNonPersonalPolicy,
        wasInvitedToNewDot,
        isOnboardingCompleted,
        canUseSubmit2026,
    ]);

    return {
        isOnboardingCompleted: hasCompletedGuidedSetupFlowSelector(onboardingValues),
        isHybridAppOnboardingCompleted,
        isOnboardingLoading: !!onboardingValues?.isLoading,
    };
}

export default useOnboardingFlowRouter;
