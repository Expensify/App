import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

/** Anything that rebuilds this URL from the navigation state goes through `getPathFromState`, so it has to survive the round trip. */
function roundTrip(path: string): string {
    const state = getAdaptedStateFromPath(path, undefined);
    return getPathFromState(state as Parameters<typeof getPathFromState>[0]);
}

function getBackgroundFullScreenName(path: string): string | undefined {
    const state = getAdaptedStateFromPath(path, undefined);
    const tabRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    return tabState?.routes?.at(tabState.index ?? (tabState.routes?.length ?? 1) - 1)?.name;
}

const CARD_PATH = '/settings/wallet/card/3428712066275360/add-to-digital-wallet';

describe('add to digital wallet URL', () => {
    it('survives a state round trip', () => {
        expect(roundTrip(CARD_PATH)).toBe(CARD_PATH);
    });

    it('keeps the backTo page underneath instead of the page the relations pin it to', () => {
        expect(getBackgroundFullScreenName(`${CARD_PATH}?backTo=${encodeURIComponent(ROUTES.HOME)}`)).toBe(SCREENS.HOME);
    });

    it('falls back to the wallet page when the link carries no backTo, which is what a card details page sends', () => {
        expect(getBackgroundFullScreenName(CARD_PATH)).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
    });
});
