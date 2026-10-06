import {hasAuthToken, isAnonymousUser} from '@libs/CurrentUserStore';

import CONST from '@src/CONST';
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

describe('isAnonymousUser', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear());

    it('returns false while the session has no auth token type', () =>
        // Given a session without an auth token type, as before sign-in
        Onyx.merge(ONYXKEYS.SESSION, {email: 'user@test.com'}).then(() => {
            // When / Then: ReportUtils hides public rooms unless the user is anonymous, so this must be false
            expect(isAnonymousUser()).toBe(false);
        }));

    it('returns true once the session holds an anonymous auth token type', () =>
        // Given a session opened as an anonymous user, e.g. a signed-out visitor of a public room
        Onyx.merge(ONYXKEYS.SESSION, {authToken: 'abc123', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS}).then(() => {
            // When / Then: the mirror reports the anonymous session so ReportUtils keeps public rooms visible
            expect(isAnonymousUser()).toBe(true);
        }));

    it('returns false again once the anonymous token type is cleared', () =>
        // Given an anonymous session
        Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS})
            // When the user signs in with a regular account, which carries no auth token type
            .then(() => Onyx.merge(ONYXKEYS.SESSION, {authTokenType: null}))
            .then(() => {
                // Then the mirror no longer treats the user as anonymous
                expect(isAnonymousUser()).toBe(false);
            }));
});
