import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account, Onboarding} from '@src/types/onyx';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

// Screens that are part of the 2FA setup flow
const ALLOWED_2FA_SCREENS = new Set([
    SCREENS.REQUIRE_TWO_FACTOR_AUTH,
    SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH,
    SCREENS.TWO_FACTOR_AUTH.ROOT,
    SCREENS.TWO_FACTOR_AUTH.VERIFY,
    SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT,
    SCREENS.TWO_FACTOR_AUTH.SUCCESS,
    SCREENS.TWO_FACTOR_AUTH.DISABLED,
    SCREENS.TWO_FACTOR_AUTH.DISABLE,
]);

/**
 * Module-level Onyx subscriptions for 2FA-related data
 */
let account: OnyxEntry<Account>;
let onboarding: OnyxEntry<Onboarding>;

Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
    },
});

/**
 * Checks if user needs to set up 2FA
 */
function shouldShow2FASetup(): boolean {
    // User needs 2FA setup but hasn't completed it yet
    if (account?.needsTwoFactorAuthSetup && !account?.requiresTwoFactorAuth) {
        return true;
    }

    // User is in the middle of 2FA setup and hasn't completed onboarding
    if (account?.twoFactorAuthSetupInProgress && !hasCompletedGuidedSetupFlowSelector(onboarding)) {
        return true;
    }

    return false;
}

/**
 * Checks if the current navigation state is showing any 2FA-related page
 */
function isCurrentlyOn2FAPage(state: NavigationState): boolean {
    return state.routes.some((route) => {
        const routeName = route.name;
        if (typeof routeName !== 'string') {
            return false;
        }
        return ALLOWED_2FA_SCREENS.has(routeName as never);
    });
}

/**
 * Checks if the action is navigating to any 2FA-related page
 * This includes both the landing page and the setup/verification flows
 */
function isNavigatingTo2FAPage(action: NavigationAction): boolean {
    if (!('payload' in action) || !action.payload) {
        return false;
    }

    const payload = action.payload as Record<string, unknown>;

    // Check if screen name is 2FA-related
    const is2FAScreen = (screenName: unknown): boolean => {
        if (typeof screenName !== 'string') {
            return false;
        }
        const result = ALLOWED_2FA_SCREENS.has(screenName as never);
        Log.info(`[TwoFactorAuthGuard] Checking screen: ${screenName}, is2FA: ${result}`);
        return result;
    };

    // Direct navigation: Navigation.navigate(...)
    if (is2FAScreen(payload.name)) {
        return true;
    }

    // Nested navigator navigation: Navigation.navigate('RightModalNavigator', {screen: 'TwoFactorAuth'})
    if (payload.params && typeof payload.params === 'object') {
        const params = payload.params as Record<string, unknown>;
        if (is2FAScreen(params.screen)) {
            return true;
        }
    }

    return false;
}

/**
 * Two-Factor Authentication Guard
 * Blocks all navigation until user completes required 2FA setup
 * This is the highest priority guard as it's a security requirement
 */
const TwoFactorAuthGuard: NavigationGuard = {
    name: 'TwoFactorAuthGuard',

    shouldApply(state: NavigationState, action: NavigationAction, context: GuardContext): boolean {
        // Don't apply if still loading
        if (context.isLoading) {
            return false;
        }

        return true;
    },

    evaluate(state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult {
        if (shouldShow2FASetup()) {
            // Already on 2FA page - allow navigation
            if (isCurrentlyOn2FAPage(state)) {
                Log.info('[TwoFactorAuthGuard] Already on 2FA page, allowing navigation');
                return {type: 'ALLOW'};
            }

            // Navigating to 2FA page - allow
            if (isNavigatingTo2FAPage(action)) {
                Log.info('[TwoFactorAuthGuard] Navigating to 2FA page, allowing navigation');
                return {type: 'ALLOW'};
            }

            // Redirect to 2FA setup page
            Log.info('[TwoFactorAuthGuard] Redirecting to 2FA setup');
            return {
                type: 'REDIRECT',
                route: ROUTES.REQUIRE_TWO_FACTOR_AUTH as Route,
            };
        }

        // 2FA not required or already completed
        return {type: 'ALLOW'};
    },
};

export default TwoFactorAuthGuard;
