import CONST from '@src/CONST';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isSupportalSessionSelector = (session: OnyxEntry<Session>) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT || !!session?.isSupportAuthTokenUsed;

const emailSelector = (session: OnyxEntry<Session>) => session?.email;

const accountIDSelector = (session: OnyxEntry<Session>) => session?.accountID;

const sessionEmailAndAccountIDSelector = (session: OnyxEntry<Session>) => ({email: session?.email, accountID: session?.accountID});

const authTokenSelector = (session: OnyxEntry<Session>) => session?.authToken;

export {emailSelector, accountIDSelector, sessionEmailAndAccountIDSelector, authTokenSelector, isSupportalSessionSelector};
