import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isSupportalSessionSelector, sessionEmailAndAccountIDSelector} from '@selectors/Session';

describe('sessionEmailAndAccountIDSelector', () => {
    it('returns email and accountID when both are present', () => {
        const session: OnyxEntry<Session> = {email: 'test@expensify.com', accountID: 12345};
        expect(sessionEmailAndAccountIDSelector(session)).toEqual({email: 'test@expensify.com', accountID: 12345});
    });

    it('returns undefined email when email is not set', () => {
        const session: OnyxEntry<Session> = {accountID: 12345};
        expect(sessionEmailAndAccountIDSelector(session)).toEqual({email: undefined, accountID: 12345});
    });

    it('returns undefined accountID when accountID is not set', () => {
        const session: OnyxEntry<Session> = {email: 'test@expensify.com'};
        expect(sessionEmailAndAccountIDSelector(session)).toEqual({email: 'test@expensify.com', accountID: undefined});
    });

    it('returns both undefined when session is empty', () => {
        const session: OnyxEntry<Session> = {};
        expect(sessionEmailAndAccountIDSelector(session)).toEqual({email: undefined, accountID: undefined});
    });

    it('returns both undefined when session is undefined', () => {
        expect(sessionEmailAndAccountIDSelector(undefined)).toEqual({email: undefined, accountID: undefined});
    });
});

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
