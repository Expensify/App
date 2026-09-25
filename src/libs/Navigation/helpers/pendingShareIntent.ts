// A share intent received while signed out is replayed after sign-in. For a user who still has to onboard, the
// onboarding flow tears the share modal down, so the share is parked here and reopened once onboarding finishes.
let hasPendingShareIntent = false;

function setPendingShareIntent() {
    hasPendingShareIntent = true;
}

/**
 * Returns whether a share intent was waiting for onboarding to finish, and clears it so it is only resumed once.
 */
function consumePendingShareIntent(): boolean {
    const hadPendingShareIntent = hasPendingShareIntent;
    hasPendingShareIntent = false;
    return hadPendingShareIntent;
}

export {setPendingShareIntent, consumePendingShareIntent};
