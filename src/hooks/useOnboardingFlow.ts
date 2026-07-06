import AccountUtils from '@libs/AccountUtils';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isLoggingInAsNewUser} from '@libs/SessionUtils';

import {completeHybridAppOnboarding} from '@userActions/Welcome';
import {startOnboardingFlow} from '@userActions/Welcome/OnboardingFlow';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import {useEffect} from 'react';

import useOnyx from './useOnyx';

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

                    // Make sure hybrid app onboarding is completed and will not start startOnboardingFlow for users that switched from OldDot.
                    if (isHybridAppOnboardingCompleted === false) {
                        completeHybridAppOnboarding();
                        return;
                    }
                }

                const isMigratedUser = hasBeenAddedToNudgeMigration ?? false;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const isInvitedOrGroupMember = (hasNonPersonalPolicy || wasInvitedToNewDot) ?? false;
                if (isMigratedUser || isInvitedOrGroupMember) {
                    return;
                }

                // Pause the onboarding redirect while the required-2FA overlay is active. The user must complete
                // required 2FA setup first; auto-resetting to onboarding on every transition fights the 2FA wizard,
                // corrupts its dynamic base route, and flashes the overlay. Once 2FA finishes, the success page clears
                // twoFactorAuthSetupInProgress and explicitly starts onboarding.
                if (AccountUtils.shouldShowRequire2FAPage(account, !!isOnboardingCompleted)) {
                    return;
                }

                // Explicitly start the onboarding flow when onboarding is not completed.
                // We use startOnboardingFlow (which calls resetRoot) instead of Navigation.navigate because
                // navigate goes through the router where OnboardingGuard would block the navigation.
                // waitForProtectedRoutes ensures navigation is ready, which is critical during fresh login.
                if (isOnboardingCompleted === false) {
                    Navigation.waitForProtectedRoutes().then(() => {
                        startOnboardingFlow({
                            onboardingValuesParam: onboardingValues ?? undefined,
                            isUserFromPublicDomain: !!account?.isFromPublicDomain,
                            hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                            currentOnboardingCompanySize: onboardingCompanySize,
                            currentOnboardingPurposeSelected: onboardingPurposeSelected,
                            onboardingInitialPath,
                            onboardingValues,
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
        account,
        onboardingCompanySize,
        onboardingPurposeSelected,
        onboardingInitialPath,
        hasBeenAddedToNudgeMigration,
        hasNonPersonalPolicy,
        wasInvitedToNewDot,
        isOnboardingCompleted,
    ]);

    return {
        isOnboardingCompleted: hasCompletedGuidedSetupFlowSelector(onboardingValues),
        isHybridAppOnboardingCompleted,
        isOnboardingLoading: !!onboardingValues?.isLoading,
    };
}

export default useOnboardingFlowRouter;
