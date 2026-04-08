import {sessionEmailAndAccountIDSelector} from '@selectors/Session';
import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

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
