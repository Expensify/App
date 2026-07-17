/**
 * Tracks whether a logged-out user opened a /concierge deep link so the app can
 * route them to Concierge after sign-up/onboarding, then clear the intent on sign-out.
 */
let hasPendingConciergeDeepLink = false;

function setPendingConciergeDeepLink() {
    hasPendingConciergeDeepLink = true;
}

function consumePendingConciergeDeepLink() {
    const shouldNavigateToConcierge = hasPendingConciergeDeepLink;
    hasPendingConciergeDeepLink = false;
    return shouldNavigateToConcierge;
}

function clearPendingConciergeDeepLink() {
    hasPendingConciergeDeepLink = false;
}

export {setPendingConciergeDeepLink, consumePendingConciergeDeepLink, clearPendingConciergeDeepLink};
