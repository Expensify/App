import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {setOnboardingErrorMessage} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import {getOnboardingInitialPath} from '@userActions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Account, Onboarding} from '@src/types/onyx';
import type {GuardResult, NavigationGuard} from './types';

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
 * Helper to get the correct onboarding route based on current progress
 */
function getOnboardingRoute(): Route {
    return getOnboardingInitialPath({
        onboardingValuesParam: onboarding,
        isUserFromPublicDomain: !!account?.isFromPublicDomain,
        hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
        currentOnboardingCompanySize: onboardingCompanySize,
        currentOnboardingPurposeSelected: onboardingPurposeSelected,
        onboardingInitialPath,
        onboardingValues: onboarding,
    }) as Route;
}

function shouldPreventReset(state: NavigationState, action: NavigationAction) {
    if (action.type !== CONST.NAVIGATION_ACTIONS.RESET || !action?.payload) {
        return false;
    }

    const currentFocusedRoute = findFocusedRoute(state);
    const targetFocusedRoute = findFocusedRoute(action?.payload as NavigationState);

    // We want to prevent the user from navigating back to a non-onboarding screen if they are currently on an onboarding screen
    if (isOnboardingFlowName(currentFocusedRoute?.name) && !isOnboardingFlowName(targetFocusedRoute?.name)) {
        setOnboardingErrorMessage('onboarding.purpose.errorBackButton');
        return true;
    }

    return false;
}

/**
 * OnboardingGuard handles ONLY the core NewDot onboarding flow
 */
const OnboardingGuard: NavigationGuard = {
    name: 'OnboardingGuard',

    evaluate: (state, action, context): GuardResult => {
        if (context.isLoading) {
            return {type: 'BLOCK', reason: 'App is still loading'};
        }

        if (shouldPreventReset(state, action)) {
            return {type: 'BLOCK', reason: 'Cannot reset to non-onboarding screen while on onboarding'};
        }

        const isTransitioning = context.currentUrl?.includes(ROUTES.TRANSITION_BETWEEN_APPS);
        const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding) ?? false;
        const isMigratedUser = tryNewDot?.hasBeenAddedToNudgeMigration ?? false;
        const isSingleEntry = hybridApp?.isSingleNewDotEntry ?? false;
        const needsExplanationModal = (CONFIG.IS_HYBRID_APP && tryNewDot?.isHybridAppOnboardingCompleted !== true) ?? false;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isInvitedOrGroupMember = (!CONFIG.IS_HYBRID_APP && (hasNonPersonalPolicy || wasInvitedToNewDot)) ?? false;

        const shouldSkipOnboarding = isTransitioning || isOnboardingCompleted || isMigratedUser || isSingleEntry || needsExplanationModal || isInvitedOrGroupMember;

        if (shouldSkipOnboarding) {
            return {type: 'ALLOW'};
        }

        // User needs onboarding - calculate the correct step and redirect
        const onboardingRoute = getOnboardingRoute();

        Log.info('[OnboardingGuard] Redirecting to onboarding route', false, {onboardingRoute});

        return {
            type: 'REDIRECT',
            route: onboardingRoute,
        };
    },
};

export default OnboardingGuard;
