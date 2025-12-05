import type {OnyxEntry} from 'react-native-onyx';
import type {CardFeeds, Domain, SamlMetadata} from '@src/types/onyx';

const domainMemberSamlSettingsSelector = (domainSettings: OnyxEntry<CardFeeds>) => domainSettings?.settings;

const domainSamlSettingsStateSelector = (domain: OnyxEntry<Domain>) =>
    domain
        ? {
              isSamlEnabledLoading: domain.isSamlEnabledLoading,
              samlEnabledError: domain.samlEnabledError,
              isSamlRequiredLoading: domain.isSamlRequiredLoading,
              samlRequiredError: domain.samlRequiredError,
          }
        : undefined;

const metaIdentitySelector = (samlMetadata: OnyxEntry<SamlMetadata>) => samlMetadata?.metaIdentity;

export {domainMemberSamlSettingsSelector, domainSamlSettingsStateSelector, metaIdentitySelector};
