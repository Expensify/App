import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

const emailSelector = (session: OnyxEntry<Session>) => session?.email;

const accountIDSelector = (session: OnyxEntry<Session>) => session?.accountID;

export {emailSelector, accountIDSelector};
