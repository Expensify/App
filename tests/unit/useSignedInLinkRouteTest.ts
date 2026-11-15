import {renderHook} from '@testing-library/react-native';

import useSignedInLinkRoute from '@components/Navigation/NavigationTabBar/useSignedInLinkRoute';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useSignedInLinkRoute', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns the route for a signed in user', async () => {
        // Given a signed in user
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token', email: 'user@expensify.com'});
        await waitForBatchedUpdates();

        // When the hook resolves the Account tab link
        const {result} = renderHook(() => useSignedInLinkRoute(ROUTES.SETTINGS));

        // Then the tab can be opened in a new browser tab
        expect(result.current).toBe(ROUTES.SETTINGS);
    });

    it('returns no route for an anonymous user', async () => {
        // Given an anonymous user, who must sign in before opening the Account tab
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        await waitForBatchedUpdates();

        // When the hook resolves the Account tab link
        const {result} = renderHook(() => useSignedInLinkRoute(ROUTES.SETTINGS));

        // Then there is no link, so a Cmd click cannot open the tab without the sign in prompt
        expect(result.current).toBeUndefined();
    });
});
