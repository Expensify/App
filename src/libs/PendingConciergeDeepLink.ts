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
