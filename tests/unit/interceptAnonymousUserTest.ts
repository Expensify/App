import * as Session from '@libs/actions/Session';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('interceptAnonymousUser', () => {
    let signOutSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        signOutSpy = jest.spyOn(Session, 'signOutAndRedirectToSignIn').mockImplementation(() => {});
    });

    afterEach(() => {
        signOutSpy.mockRestore();
    });

    it('redirects to sign in for a passed anonymous session even when the stored session is signed in', async () => {
        // Given a signed-in session stored in Onyx
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@example.com'});
        await waitForBatchedUpdates();
        const callback = jest.fn();

        // When the action is intercepted for an anonymous session passed by the caller
        interceptAnonymousUser(callback, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});

        // Then the passed session decides: the user is sent to sign in and the action does not run
        expect(signOutSpy).toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalled();
    });

    it('runs the action for a passed signed-in session even when the stored session is anonymous', async () => {
        // Given an anonymous session stored in Onyx
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        await waitForBatchedUpdates();
        const callback = jest.fn();

        // When the action is intercepted for a signed-in session passed by the caller
        interceptAnonymousUser(callback, {email: 'user@example.com'});

        // Then the passed session decides: the action runs and there is no redirect
        expect(callback).toHaveBeenCalledTimes(1);
        expect(signOutSpy).not.toHaveBeenCalled();
    });
});
