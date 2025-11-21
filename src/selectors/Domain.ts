import type {OnyxEntry} from 'react-native-onyx';
import type {CardFeeds, Domain} from '@src/types/onyx';

const domainMemberSamlSettingsSelector = (domainSettings: OnyxEntry<CardFeeds>) => domainSettings?.settings;

const domainSamlMetadataErrorSelector = (domain: OnyxEntry<Domain>) => domain?.samlMetadataError;
const domainSettingsSelector = (domain: OnyxEntry<Domain>) =>
    domain
        ? {
              settings: domain.settings,
          }
        : undefined;

export {domainMemberSamlSettingsSelector, domainSamlMetadataErrorSelector, domainSettingsSelector};
