import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, Domain, DomainSettings, SamlMetadata} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

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

const domainNameSelector = (domain: OnyxEntry<Domain>) => (domain?.email ? Str.extractEmailDomain(domain.email) : undefined);

const domainSettingsPrimaryContactSelector = (domainSettings: OnyxEntry<DomainSettings>) => domainSettings?.settings?.technicalContactEmail;

const metaIdentitySelector = (samlMetadata: OnyxEntry<SamlMetadata>) => samlMetadata?.metaIdentity;

/**
 * Extracts a list of admin IDs (accountIDs) from the domain object.
 * It filters the domain properties for keys starting with the admin permissions prefix
 * and returns the values as an array of numbers.
 *
 * @param domain - The domain object from Onyx
 * @returns An array of admin account IDs
 */
function adminAccountIDsSelector(domain: OnyxEntry<Domain>): number[] {
    if (!domain) {
        return [];
    }

    return (
        Object.entries(domain).reduce<number[]>((acc, [key, value]) => {
            if (!key.startsWith(ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX) || value === undefined || value === null) {
                return acc;
            }

            acc.push(Number(value));

            return acc;
        }, []) ?? getEmptyArray<number>()
    );
}

// TODO unify that with domainSettingsPrimaryContactSelector
const technicalContactEmailSelector = (domainMemberSharedNVP: OnyxEntry<CardFeeds>) => domainMemberSharedNVP?.settings?.technicalContactEmail;


export {domainMemberSamlSettingsSelector, domainSettingsPrimaryContactSelector, domainSamlSettingsStateSelector, domainNameSelector, metaIdentitySelector, adminAccountIDsSelector, technicalContactEmailSelector};
