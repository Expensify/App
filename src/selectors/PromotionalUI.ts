import type {Account, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isActingAsDelegateSelector} from './Account';
import {isSupportalSessionSelector} from './Session';

/**
 * Returns true when promo, training, and onboarding UI should be hidden.
 * Supportal agents and copilots should not interact with marketing UI on behalf of another account.
 */
const shouldSuppressPromotionalUISelector = (session: OnyxEntry<Session>, account: OnyxEntry<Account>) => isSupportalSessionSelector(session) || isActingAsDelegateSelector(account);

export default shouldSuppressPromotionalUISelector;
