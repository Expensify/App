import type {OnyxEntry} from 'react-native-onyx';
import type {Account} from '@src/types/onyx';

const isActingAsDelegateSelector = (account: OnyxEntry<Account>) => !!account?.delegatedAccess?.delegate;

const isUserValidatedSelector = (account: OnyxEntry<Account>) => account?.validated;

const primaryLoginSelector = (account: OnyxEntry<Account>) => account?.primaryLogin;

const delegatesSelector = (account: OnyxEntry<Account>) => account?.delegatedAccess?.delegates;

const hasBiometricsRegisteredSelector = (data: OnyxEntry<Account>) => data?.multifactorAuthenticationPublicKeyIDs && data.multifactorAuthenticationPublicKeyIDs.length > 0;

const isAccountLoadingSelector = (data: OnyxEntry<Account>) => !!data?.isLoading;

const requiresTwoFactorAuthSelector = (data: OnyxEntry<Account>) => data?.requiresTwoFactorAuth;

export {
    isActingAsDelegateSelector,
    isUserValidatedSelector,
    primaryLoginSelector,
    delegatesSelector,
    hasBiometricsRegisteredSelector,
    isAccountLoadingSelector,
    requiresTwoFactorAuthSelector,
};
