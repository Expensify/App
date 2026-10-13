import {saveCurrentPathBeforeBackground} from '@libs/actions/App';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {navigationRef} from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function mockRootState(state: NavigationState) {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    jest.spyOn(navigationRef, 'getRootState').mockReturnValue(state);
}

describe('saveCurrentPathBeforeBackground', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '/search?q=status:outstanding');
        await Onyx.set(ONYXKEYS.SESSION, {authToken: 'token', accountID: 1, email: 'test@example.com'});
        await waitForBatchedUpdates();
    });

    it('keeps the page a forced re-auth kept when the sign in page backgrounds behind the SAML browser', async () => {
        await Onyx.set(ONYXKEYS.SESSION, null);
        await waitForBatchedUpdates();
        // The navigator only ever reads routes and names, so a partial state stands in for a rehydrated one.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        mockRootState(getAdaptedStateFromPath('/inbox' as Route) as unknown as NavigationState);

        saveCurrentPathBeforeBackground();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.LAST_VISITED_PATH)).toBe('/search?q=status:outstanding');
    });

    it('keeps the page a forced re-auth kept when the app backgrounds on the transition screen', async () => {
        mockRootState({
            key: 'root',
            index: 0,
            routeNames: [SCREENS.TRANSITION_BETWEEN_APPS],
            routes: [{key: 'transition', name: SCREENS.TRANSITION_BETWEEN_APPS, params: {shortLivedAuthToken: 'abc123', isSAML: true}}],
            stale: false,
            type: 'stack',
        });

        saveCurrentPathBeforeBackground();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.LAST_VISITED_PATH)).toBe('/search?q=status:outstanding');
    });

    it('still saves a normal page when the app backgrounds', async () => {
        // The navigator only ever reads routes and names, so a partial state stands in for a rehydrated one.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        mockRootState(getAdaptedStateFromPath('/settings/profile' as Route) as unknown as NavigationState);

        saveCurrentPathBeforeBackground();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.LAST_VISITED_PATH)).toBe('/settings/profile');
    });
});
