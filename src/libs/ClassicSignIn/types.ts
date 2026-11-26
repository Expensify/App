/**
 * Opens the Expensify Classic sign-in page in place of the current page, once no other page is about to open.
 * While a sign out hasn't reached Expensify Classic yet, it opens the sign-out page, which ends on the sign-in page.
 * Returns a function that withdraws the request while it's still waiting. Does nothing on any host other than the one that serves both products.
 */
type OpenClassicSignIn = () => () => void;

/**
 * Whether this tab can open the Expensify Classic sign-in page again. It can't once the page opened too often within a short time,
 * since a sign-in page that keeps coming back without a session would otherwise send the user around in a loop.
 * While a sign out hasn't reached Expensify Classic yet it always can, since a sign-in request then opens the sign-out page, which is never limited.
 */
type CanOpenClassicSignIn = () => boolean;

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

export type {CanOpenClassicSignIn, OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring};
