import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isSupportalSessionSelector} from '@selectors/Session';

describe('isSupportalSessionSelector', () => {
    it('returns true when the session uses a support auth token', () => {
        const session: OnyxEntry<Session> = {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT};
        expect(isSupportalSessionSelector(session)).toBe(true);
    });

    it('returns true mid-transition when isSupportAuthTokenUsed is set', () => {
        const session: OnyxEntry<Session> = {isSupportAuthTokenUsed: true};
        expect(isSupportalSessionSelector(session)).toBe(true);
    });

    it('returns false for a non-supportal session', () => {
        const session: OnyxEntry<Session> = {email: 'test@expensify.com'};
        expect(isSupportalSessionSelector(session)).toBe(false);
    });

    it('returns false when session is empty', () => {
        expect(isSupportalSessionSelector({})).toBe(false);
    });

    it('returns false when session is undefined', () => {
        expect(isSupportalSessionSelector(undefined)).toBe(false);
    });
});
