import SCREENS from '@src/SCREENS';

/**
 * Deeplink-only variant of HOME_TO_RHP. Consulted ONLY when navigation state is built from a path
 * (deeplink / browser refresh / cold load) via the `isDeeplink` flag in getMatchingFullScreenRoute,
 * so these RHP screens still get Home underneath on a fresh load without forcing it for in-app navigation.
 */
const HOME_TO_RHP_DEEPLINK: Record<typeof SCREENS.HOME, string[]> = {
    // Also opened from a chat message, so it must not force Home underneath on click.
    [SCREENS.HOME]: [SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO],
};

export default HOME_TO_RHP_DEEPLINK;
