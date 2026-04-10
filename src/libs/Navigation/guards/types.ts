import type {NavigationAction, NavigationState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';

/**
 * Result returned by a navigation guard after evaluation
 */
type GuardResult = {type: 'ALLOW'} | {type: 'BLOCK'; reason?: string} | {type: 'REDIRECT'; route: Route};

/**
 * Context provided to guards during evaluation
 */
type GuardContext = {
    /** Whether the user is authenticated */
    isAuthenticated: boolean;

    /** Whether the app is still loading initial data */
    isLoading: boolean;

    /** Current URL (for HybridApp and deep link checks) */
    currentUrl: string;
};

/**
 * Navigation guard interface
 * Guards can intercept navigation actions and allow, block, or redirect them
 */
type NavigationGuard = {
    /** Guard name for debugging and logging */
    name: string;

    /**
     * Evaluates the navigation action and returns a decision
     * - ALLOW: Let navigation proceed normally
     * - BLOCK: Prevent navigation and keep current state
     * - REDIRECT: Replace the navigation with a redirect to a different route
     */
    evaluate(state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult;
};

export type {GuardResult, GuardContext, NavigationGuard};
