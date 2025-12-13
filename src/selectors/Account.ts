import type {OnyxEntry} from 'react-native-onyx';
import type {Account} from '@src/types/onyx';

const isActingAsDelegateSelector = (account: OnyxEntry<Account>) => !!account?.delegatedAccess?.delegate;

const isUserValidatedSelector = (account: OnyxEntry<Account>) => account?.validated;

const primaryLoginSelector = (account: OnyxEntry<Account>) => account?.primaryLogin;

/**
 * Determines if the user needs to complete 2FA setup.
 * This is the base condition - components may have additional conditions.
 */
const needsTwoFactorAuthSetupSelector = (account: OnyxEntry<Account>) => !!account?.needsTwoFactorAuthSetup && !account?.requiresTwoFactorAuth;

export {isActingAsDelegateSelector, isUserValidatedSelector, primaryLoginSelector, needsTwoFactorAuthSetupSelector};
