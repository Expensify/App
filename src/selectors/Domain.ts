import type {OnyxEntry} from 'react-native-onyx';
import type {CardFeeds, Domain} from '@src/types/onyx';

const domainMemberSamlSettingsSelector = (domainSettings: OnyxEntry<CardFeeds>) => domainSettings?.settings;

const domainSettingsSelector = (domain: OnyxEntry<Domain>) =>
    domain
        ? {
              settings: domain.settings,
          }
        : undefined;

export {domainMemberSamlSettingsSelector, domainSettingsSelector};
