import type {OnyxEntry} from 'react-native-onyx';
import type {Domain, DomainSettings} from '@src/types/onyx';

const domainMemberSamlSettingsSelector = (domainSettings: OnyxEntry<DomainSettings>) => ({
    isSamlEnabled: domainSettings?.settings.samlEnabled,
    isSamlRequired: domainSettings?.settings.samlRequired,
    oktaSCIM: domainSettings?.settings.oktaSCIM,
});

const domainSamlMetadataErrorSelector = (domain: OnyxEntry<Domain>) => domain?.samlMetadataError;
const domainSettingsSelector = (domain: OnyxEntry<Domain>) =>
    domain
        ? {
              settings: domain.settings,
          }
        : undefined;

export {domainMemberSamlSettingsSelector, domainSamlMetadataErrorSelector, domainSettingsSelector};
