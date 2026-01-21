import type {NavigationAction, NavigationState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';
import type {Account, Onboarding, Session} from '@src/types/onyx';

/**
 * Result returned by a navigation guard after evaluation
 */
type GuardResult = {type: 'ALLOW'} | {type: 'BLOCK'; reason?: string} | {type: 'REDIRECT'; route: Route};

/**
 * Base guard context with common navigation-related data
 */
type BaseGuardContext = {
    /** Whether the user is authenticated */
    isAuthenticated: boolean;

    /** Whether the app is still loading initial data */
    isLoading: boolean;

    /** Current URL (for HybridApp and deep link checks) */
    currentUrl: string;
};

/**
 * Onyx data that can be passed to guards from components/hooks
 * Used for initial state evaluation to avoid timing issues with module-level subscriptions
 */
type GuardOnyxData = {
    /** Account data - passed from component/hook for initial state evaluation */
    account?: Account;

    /** Onboarding data - passed from component/hook for initial state evaluation */
    onboarding?: Onboarding;

    /** Session data - passed from component/hook for initial state evaluation */
    session?: Session;
};

/**
 * Complete context provided to guards during evaluation
 * Combines base context with optional Onyx data
 */
type GuardContext = BaseGuardContext & GuardOnyxData;

/**
 * Navigation guard interface
 * Guards can intercept navigation actions and allow, block, or redirect them
 */
type NavigationGuard = {
    /** Guard name for debugging and logging */
    name: string;

    /**
     * Determines if this guard should evaluate for the given navigation action
     * Use this to skip evaluation when the guard is not relevant
     */
    shouldApply(state: NavigationState, action: NavigationAction, context: GuardContext): boolean;

    /**
     * Evaluates the navigation action and returns a decision
     * - ALLOW: Let navigation proceed normally
     * - BLOCK: Prevent navigation and keep current state
     * - REDIRECT: Replace the navigation with a redirect to a different route
     */
    evaluate(state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult;
};

export type {GuardResult, GuardContext, BaseGuardContext, GuardOnyxData, NavigationGuard};
