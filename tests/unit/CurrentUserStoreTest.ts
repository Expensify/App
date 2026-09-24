import {hasAuthToken} from '@libs/CurrentUserStore';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('hasAuthToken', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear());

    it('returns false while the session holds no auth token', () =>
        Onyx.merge(ONYXKEYS.SESSION, {email: 'user@test.com'}).then(() => {
            expect(hasAuthToken()).toBe(false);
        }));

    it('returns true once the session holds an auth token', () =>
        Onyx.merge(ONYXKEYS.SESSION, {authToken: 'abc123'}).then(() => {
            expect(hasAuthToken()).toBe(true);
        }));

    it('returns false again once the auth token is cleared', () =>
        Onyx.merge(ONYXKEYS.SESSION, {authToken: 'abc123'})
            .then(() => Onyx.merge(ONYXKEYS.SESSION, {authToken: null}))
            .then(() => {
                expect(hasAuthToken()).toBe(false);
            }));
});
