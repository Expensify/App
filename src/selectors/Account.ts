import type {OnyxEntry} from 'react-native-onyx';
import type {Account} from '@src/types/onyx';

const isActingAsDelegateSelector = (account: OnyxEntry<Account>) => !!account?.delegatedAccess?.delegate;

const delegateEmailSelector = (account: OnyxEntry<Account>) => account?.delegatedAccess?.delegate ?? '';

const isUserValidatedSelector = (account: OnyxEntry<Account>) => account?.validated;

const primaryLoginSelector = (account: OnyxEntry<Account>) => account?.primaryLogin;

const delegatesSelector = (account: OnyxEntry<Account>) => account?.delegatedAccess?.delegates;

const requiresTwoFactorAuthSelector = (data: OnyxEntry<Account>) => data?.requiresTwoFactorAuth;

const accountGuideDetailsSelector = (account: OnyxEntry<Account>) => account?.guideDetails;

const mfaCredentialIDsSelector = (data: OnyxEntry<Account>) => data?.multifactorAuthenticationPublicKeyIDs;

const isFromInternalDomainSelector = (account: OnyxEntry<Account>) => account?.isFromInternalDomain;

export {
    isActingAsDelegateSelector,
    delegateEmailSelector,
    isUserValidatedSelector,
    primaryLoginSelector,
    delegatesSelector,
    requiresTwoFactorAuthSelector,
    accountGuideDetailsSelector,
    mfaCredentialIDsSelector,
    isFromInternalDomainSelector,
};
