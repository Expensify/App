import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import {useEffect, useMemo, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isLoggingInAsNewUser} from '@libs/SessionUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
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
    const [currentOnboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [currentOnboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [onboardingInitialPath, onboardingInitialPathMetadata] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH, {canBeMissing: true});
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isOnboardingLoading = isLoadingOnyxValue(onboardingInitialPathMetadata, accountMetadata);

    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: emailSelector});
    const isLoggingInAsNewSessionUser = isLoggingInAsNewUser(currentUrl, sessionEmail);
    const startedOnboardingFlowRef = useRef(false);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: tryNewDotOnyxSelector,
        canBeMissing: true,
    });
    const {isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const [isSingleNewDotEntry, isSingleNewDotEntryMetadata] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isSingleNewDotEntrySelector, canBeMissing: true});
    const shouldShowRequire2FAPage = useMemo(
        () => (!!account?.needsTwoFactorAuthSetup && !account?.requiresTwoFactorAuth) || (!!account?.twoFactorAuthSetupInProgress && !hasCompletedGuidedSetupFlowSelector(onboardingValues)),
        [account?.needsTwoFactorAuthSetup, account?.requiresTwoFactorAuth, account?.twoFactorAuthSetupInProgress, onboardingValues],
    );

    useEffect(() => {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const handle = InteractionManager.runAfterInteractions(() => {
            // Prevent starting the onboarding flow if we are logging in as a new user with short lived token
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

            if (currentUrl.endsWith('/r')) {
                // Don't trigger onboarding if we are in the middle of a redirect to a report
                return;
            }

            if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining)) {
                const navigationState = navigationRef.getRootState();
                const lastRoute = navigationState.routes.at(-1);
                // Prevent duplicate navigation if the migrated user modal is already shown.
                if (lastRoute?.name !== NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR) {
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
                    Navigation.navigate(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute(true));
                }
                return;
            }

            if (hasBeenAddedToNudgeMigration) {
                return;
            }

            const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboardingValues) && onboardingValues?.testDriveModalDismissed !== false;

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
                    Log.info('[Onboarding] Hybrid app onboarding is completed, but NewDot onboarding is not completed, starting NewDot onboarding flow');
                    startOnboardingFlow({
                        onboardingValuesParam: onboardingValues,
                        isUserFromPublicDomain: !!account?.isFromPublicDomain,
                        hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                        currentOnboardingCompanySize,
                        currentOnboardingPurposeSelected,
                        onboardingInitialPath,
                        onboardingValues,
                    });
                }
            }

            // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
            if (!CONFIG.IS_HYBRID_APP && isOnboardingCompleted === false && !startedOnboardingFlowRef.current) {
                startedOnboardingFlowRef.current = true;
                Log.info('[Onboarding] Not a hybrid app, NewDot onboarding is not completed, starting NewDot onboarding flow');
                startOnboardingFlow({
                    onboardingValuesParam: onboardingValues,
                    isUserFromPublicDomain: !!account?.isFromPublicDomain,
                    hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                    currentOnboardingCompanySize,
                    currentOnboardingPurposeSelected,
                    onboardingInitialPath,
                    onboardingValues,
                });
            }
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
        hasBeenAddedToNudgeMigration,
        dismissedProductTrainingMetadata,
        dismissedProductTraining?.migratedUserWelcomeModal,
        onboardingValues,
        dismissedProductTraining,
        account?.isFromPublicDomain,
        account?.hasAccessibleDomainPolicies,
        currentUrl,
        isLoggingInAsNewSessionUser,
        currentOnboardingCompanySize,
        currentOnboardingPurposeSelected,
        onboardingInitialPath,
        isOnboardingLoading,
    ]);

    return {
        isOnboardingCompleted: hasCompletedGuidedSetupFlowSelector(onboardingValues),
        isHybridAppOnboardingCompleted,
        shouldShowRequire2FAPage,
        isOnboardingLoading: !!onboardingValues?.isLoading,
    };
}

export default useOnboardingFlowRouter;
