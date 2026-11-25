/**
 * Opens the Expensify Classic sign-in page in place of the current page, once no other page is about to open.
 * While a sign out hasn't reached Expensify Classic yet, it opens the sign-out page, which ends on the sign-in page.
 * Returns a function that withdraws the request while it's still waiting. Does nothing on any host other than the one that serves both products.
 */
type OpenClassicSignIn = () => () => void;

/**
 * Opens the Expensify Classic sign-out page once the given cleanup settles, so the Expensify Classic session ends too.
 * Does nothing on any host other than the one that serves both products.
 */
type OpenClassicSignOutAfter = (cleanup: Promise<unknown>) => void;

/**
 * Keeps the Expensify Classic sign-in page from opening while a sign out opens another page itself.
 * If that navigation fails, the sign-in page can open again.
 */
type PreventClassicSignInDuring = (navigation: Promise<unknown>) => void;

export type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring};
