import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isSupportalSessionSelector = (session: OnyxEntry<Session>) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT || !!session?.isSupportAuthTokenUsed;

const isDelegateSessionSelector = (session: OnyxEntry<Session>) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.DELEGATE;

const isAnonymousSessionSelector = (session: OnyxEntry<Session>) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

const emailSelector = (session: OnyxEntry<Session>) => session?.email;

const accountIDSelector = (session: OnyxEntry<Session>) => session?.accountID;

const sessionEmailAndAccountIDSelector = (session: OnyxEntry<Session>) => ({email: session?.email, accountID: session?.accountID});

const authTokenSelector = (session: OnyxEntry<Session>) => session?.authToken;

/** Whether the user is signed in to a real account, which excludes the anonymous sessions used to view public rooms */
const hasNonAnonymousSessionSelector = (session: OnyxEntry<Session>) => !!session?.authToken && session.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

export {
    emailSelector,
    accountIDSelector,
    sessionEmailAndAccountIDSelector,
    authTokenSelector,
    hasNonAnonymousSessionSelector,
    isSupportalSessionSelector,
    isDelegateSessionSelector,
    isAnonymousSessionSelector,
};
