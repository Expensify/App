import type {OnyxEntry} from 'react-native-onyx';
import type {CardFeeds, Domain, DomainSettings} from '@src/types/onyx';

const domainMemberSamlSettingsSelector = (domainSettings: OnyxEntry<CardFeeds>) => domainSettings?.settings as DomainSettings['settings'] | undefined;

const domainSamlMetadataErrorSelector = (domain: OnyxEntry<Domain>) => domain?.samlMetadataError;
const domainSettingsSelector = (domain: OnyxEntry<Domain>) =>
    domain
        ? {
              settings: domain.settings,
          }
        : undefined;

export {domainMemberSamlSettingsSelector, domainSamlMetadataErrorSelector, domainSettingsSelector};
