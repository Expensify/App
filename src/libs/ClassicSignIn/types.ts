/** Opens the Expensify Classic sign-in page in place of the current page. Returns false, without navigating, on any host other than the one that serves both products. */
type OpenClassicSignIn = () => boolean;

/**
 * Opens the Expensify Classic sign-out page once the given cleanup settles, so the Expensify Classic session ends too.
 * Returns false, without navigating, on any host other than the one that serves both products.
 */
type OpenClassicSignOutAfter = (cleanup: Promise<unknown>) => boolean;

/** Keeps the Expensify Classic sign-in page from opening, for a sign out that is about to open another page itself. */
type PreventClassicSignIn = () => void;

export type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignIn};
