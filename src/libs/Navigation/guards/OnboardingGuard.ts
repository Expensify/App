import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import {isLoggingInAsNewUser} from '@libs/SessionUtils';
import {getOnboardingInitialPath} from '@userActions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Account, Onboarding, Session} from '@src/types/onyx';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

type OnboardingCompanySize = ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;
type OnboardingPurpose = ValueOf<typeof CONST.ONBOARDING_CHOICES>;

/**
 * Module-level Onyx subscriptions for OnboardingGuard
 * These provide synchronous access to onboarding-related data
 */
let session: OnyxEntry<Session>;
let isLoadingApp = true;
let onboarding: OnyxEntry<Onboarding>;
let account: OnyxEntry<Account>;
let tryNewDot: {isHybridAppOnboardingCompleted: boolean | undefined; hasBeenAddedToNudgeMigration: boolean} | undefined;
let hybridApp: {isSingleNewDotEntry?: boolean} | undefined;
let onboardingPurposeSelected: OnyxEntry<OnboardingPurpose>;
let onboardingCompanySize: OnyxEntry<OnboardingCompanySize>;
let onboardingInitialPath: OnyxEntry<string>;
let hasNonPersonalPolicy: OnyxEntry<boolean>;
let wasInvitedToNewDot: boolean | undefined;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = value ?? true;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        tryNewDot = value ? tryNewDotOnyxSelector(value) : undefined;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.HYBRID_APP,
    callback: (value) => {
        hybridApp = {isSingleNewDotEntry: value ? isSingleNewDotEntrySelector(value) : undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    callback: (value) => {
        onboardingPurposeSelected = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
    callback: (value) => {
        onboardingCompanySize = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
    callback: (value) => {
        onboardingInitialPath = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.HAS_NON_PERSONAL_POLICY,
    callback: (value) => {
        hasNonPersonalPolicy = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => {
        wasInvitedToNewDot = value ? wasInvitedToNewDotSelector(value) : undefined;
    },
});

/**
 * OnboardingGuard handles ONLY the core NewDot onboarding flow
 */
const OnboardingGuard: NavigationGuard = {
    name: 'OnboardingGuard',

    shouldApply: () => {
        // This guard needs to evaluate all navigation to determine if onboarding is required
        return true;
    },

    evaluate: (state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult => {
        // Get the target route from the action
        const getTargetRoute = () => {
            if (action.type === 'NAVIGATE' && 'payload' in action && action.payload && typeof action.payload === 'object' && 'name' in action.payload) {
                return action.payload.name as string;
            }
            return null;
        };

        const targetRoute = getTargetRoute();
        const currentUrl = getCurrentUrl();
        const sessionEmail = session?.email;
        const isLoggingInAsNewSessionUser = isLoggingInAsNewUser(currentUrl, sessionEmail);

        // 1. ALLOW: Still loading critical data
        if (isLoadingApp !== false) {
            return {type: 'ALLOW'};
        }

        // 2. ALLOW: Transitioning from OldDot with short-lived token
        if (currentUrl?.includes(ROUTES.TRANSITION_BETWEEN_APPS) && isLoggingInAsNewSessionUser) {
            return {type: 'ALLOW'};
        }

        // 3. ALLOW: Mid-redirect (URL ends with /r)
        if (currentUrl?.endsWith('/r')) {
            return {type: 'ALLOW'};
        }

        // 4. ALLOW: Navigating to onboarding screens (user is in onboarding flow)
        if (targetRoute && isOnboardingFlowName(targetRoute)) {
            return {type: 'ALLOW'};
        }

        // 5. ALLOW: Currently on onboarding screen
        // Only check focused route if state has routes (not on initial empty state)
        if (state.routes && state.routes.length > 0) {
            const focusedRoute = findFocusedRoute(state);
            const isCurrentlyOnOnboarding = focusedRoute && isOnboardingFlowName(focusedRoute.name);
            if (isCurrentlyOnOnboarding) {
                return {type: 'ALLOW'};
            }
        }

        // 6. CHECK IF USER HAS COMPLETED ONBOARDING
        const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding);

        // 7. SKIP ONBOARDING FOR SPECIAL CASES
        const {hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

        // Skip onboarding for migrated users (they'll see migrated user modal instead)
        if (hasBeenAddedToNudgeMigration) {
            return {type: 'ALLOW'};
        }

        // 8. HYBRID APP ONBOARDING
        if (CONFIG.IS_HYBRID_APP) {
            const isSingleNewDotEntry = hybridApp?.isSingleNewDotEntry;
            const {isHybridAppOnboardingCompleted} = tryNewDot ?? {};

            // Skip onboarding for single entries from OldDot (e.g., Travel feature)
            if (isSingleNewDotEntry) {
                return {type: 'ALLOW'};
            }

            // Skip NewDot onboarding if HybridApp onboarding (explanation modal) not completed yet
            // The explanation modal should be handled by a separate guard
            if (isHybridAppOnboardingCompleted === false) {
                return {type: 'ALLOW'};
            }

            // HybridApp onboarding completed, but NewDot onboarding not completed
            // REDIRECT to NewDot onboarding
            if (isHybridAppOnboardingCompleted === true && !isOnboardingCompleted) {
                const onboardingRoute = getOnboardingInitialPath({
                    onboardingValuesParam: onboarding,
                    isUserFromPublicDomain: !!account?.isFromPublicDomain,
                    hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                    currentOnboardingCompanySize: onboardingCompanySize,
                    currentOnboardingPurposeSelected: onboardingPurposeSelected,
                    onboardingInitialPath,
                    onboardingValues: onboarding,
                });

                return {
                    type: 'REDIRECT',
                    route: onboardingRoute as Route,
                };
            }
        }

        // 9. STANDALONE (NON-HYBRID) ONBOARDING
        if (!CONFIG.IS_HYBRID_APP && !isOnboardingCompleted) {
            // Skip onboarding if user is part of a group workspace or was invited
            const shouldSkipOnboarding =
                hasNonPersonalPolicy ?? // User is part of a group workspace
                wasInvitedToNewDot; // User was invited to NewDot

            if (shouldSkipOnboarding) {
                return {type: 'ALLOW'};
            }

            // REDIRECT to onboarding flow
            const onboardingRoute = getOnboardingInitialPath({
                onboardingValuesParam: onboarding,
                isUserFromPublicDomain: !!account?.isFromPublicDomain,
                hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                currentOnboardingCompanySize: onboardingCompanySize,
                currentOnboardingPurposeSelected: onboardingPurposeSelected,
                onboardingInitialPath,
                onboardingValues: onboarding,
            });

            return {
                type: 'REDIRECT',
                route: onboardingRoute as Route,
            };
        }

        // 10. ALLOW: Onboarding is complete or not required
        return {type: 'ALLOW'};
    },
};

export default OnboardingGuard;
