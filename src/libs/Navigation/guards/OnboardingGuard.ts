import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import {getOnboardingInitialPath} from '@userActions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Account, Onboarding} from '@src/types/onyx';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

type OnboardingCompanySize = ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;
type OnboardingPurpose = ValueOf<typeof CONST.ONBOARDING_CHOICES>;

/**
 * Module-level Onyx subscriptions for OnboardingGuard
 * These provide synchronous access to onboarding-related data
 */
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

    evaluate: (state: NavigationState | undefined, action: NavigationAction, context: GuardContext): GuardResult => {
        // Handle case where state is not yet initialized
        if (!state?.routes?.length) {
            return {type: 'ALLOW'};
        }

        // Get the target route from the action
        const getTargetRoute = () => {
            if (action.type === 'NAVIGATE' && 'payload' in action && action.payload && typeof action.payload === 'object' && 'name' in action.payload) {
                return action.payload.name as string;
            }
            return null;
        };

        const targetRoute = getTargetRoute();
        const focusedRoute = findFocusedRoute(state);

        // Early exit: Allow if navigating to or currently on onboarding
        const isNavigatingToOnboarding = targetRoute && isOnboardingFlowName(targetRoute);
        const isCurrentlyOnOnboarding = isOnboardingFlowName(focusedRoute?.name);

        if (isNavigatingToOnboarding || isCurrentlyOnOnboarding) {
            return {type: 'ALLOW'};
        }

        // Only redirect authenticated users
        if (!context.isAuthenticated) {
            return {type: 'ALLOW'};
        }

        // Don't redirect during transition flow (e.g., switching between apps)
        const isTransitioning = context.currentUrl?.includes('transition');
        if (isTransitioning) {
            return {type: 'ALLOW'};
        }

        // Calculate all skip conditions
        const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding) ?? false;
        const isMigratedUser = tryNewDot?.hasBeenAddedToNudgeMigration ?? false;
        const isSingleEntry = hybridApp?.isSingleNewDotEntry ?? false;
        const needsExplanationModal = (CONFIG.IS_HYBRID_APP && tryNewDot?.isHybridAppOnboardingCompleted !== true) ?? false;
        const isInvitedOrGroupMember = (!CONFIG.IS_HYBRID_APP && (hasNonPersonalPolicy ?? wasInvitedToNewDot)) ?? false;

        const shouldSkipOnboarding = isOnboardingCompleted || isMigratedUser || isSingleEntry || needsExplanationModal || isInvitedOrGroupMember;

        if (shouldSkipOnboarding) {
            return {type: 'ALLOW'};
        }

        // Need onboarding - redirect
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
    },
};

export default OnboardingGuard;
