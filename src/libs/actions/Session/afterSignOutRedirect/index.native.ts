import type AfterSignOutRedirect from './types';


/**
 * Native implementation of afterSignOutRedirect is a no-op.
 *
 * For Hybrid App where there are two platforms, we handle the sign out of Classic elsewhere, with HybridAppModule.signOutFromOldDot.
 * For standalone New Expensify, we don't need to redirect to Classic because it's a separate app.
 */
const afterSignOutRedirect: AfterSignOutRedirect = () => {
    // No-op: Native doesn't need to handle classic sign out redirection
};

export default afterSignOutRedirect;
