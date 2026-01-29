import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import OnboardingGuard from './OnboardingGuard';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

/**
 * Module-level Onyx subscriptions for common guard context values
 * These provide synchronous access to shared data used by multiple guards
 */
let session: OnyxEntry<Session>;
let isLoadingApp = true;

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

/**
 * Registry of all navigation guards
 * Guards are evaluated in the order they are registered
 */
const guards: NavigationGuard[] = [];

/**
 * Registers a navigation guard
 */
function registerGuard(guard: NavigationGuard): void {
    guards.push(guard);
}

/**
 * Creates a guard context with common computed values
 * Guards access specific Onyx data directly via their own subscriptions for runtime checks,
 *
 * @param overrides - Optional context overrides (e.g., account, onboarding data from hooks)
 * @returns Guard context with common helper flags and optional Onyx data
 */
function createGuardContext(overrides?: Partial<GuardContext>): GuardContext {
    const isAuthenticated = !!session?.authToken;
    const currentUrl = getCurrentUrl();
    const isLoading = isLoadingApp;

    return {
        isAuthenticated,
        isLoading,
        currentUrl,
        ...overrides,
    };
}

/**
 * Evaluates all registered guards for the given navigation action
 * Evaluation short-circuits on the first BLOCK or REDIRECT result.
 *
 * - BLOCK: block navigation, return unchanged state
 * - REDIRECT: create redirect action and process it
 * - ALLOW: continue with normal navigation
 */
function evaluateGuards(state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult {
    for (const guard of guards) {
        const result = guard.evaluate(state, action, context);

        if (result.type === 'BLOCK' || result.type === 'REDIRECT') {
            return result;
        }
    }

    return {type: 'ALLOW'};
}

/**
 * Gets all registered guards (useful for testing)
 */
function getRegisteredGuards(): readonly NavigationGuard[] {
    return guards;
}

/**
 * Clears all registered guards (useful for testing)
 */
function clearGuards(): void {
    guards.length = 0;
}

// Register guards in order of evaluation
// IMPORTANT: Order matters! Guards evaluate in sequence and short-circuit on BLOCK/REDIRECT

registerGuard(OnboardingGuard);

export {registerGuard, createGuardContext, evaluateGuards, getRegisteredGuards, clearGuards};
export type {NavigationGuard, GuardResult, GuardContext};
