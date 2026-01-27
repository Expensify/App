import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {CardFeeds, Domain, DomainPendingActions, DomainSecurityGroup, DomainSettings, SamlMetadata} from '@src/types/onyx';
import type {SecurityGroupKey, SecurityGroupsData} from '@src/types/onyx/Domain';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';

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
            if (!key.startsWith(CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX) || value === undefined || value === null) {
                return acc;
            }

            acc.push(Number(value));

            return acc;
        }, []) ?? getEmptyArray<number>()
    );
}

const technicalContactSettingsSelector = (domainMemberSharedNVP: OnyxEntry<CardFeeds>) => {
    return {
        technicalContactEmail: domainMemberSharedNVP?.settings?.technicalContactEmail,
        useTechnicalContactBillingCard: domainMemberSharedNVP?.settings?.useTechnicalContactBillingCard,
    };
};

const domainEmailSelector = (domain: OnyxEntry<Domain>) => domain?.email;

/**
 * Extracts a list of member IDs (accountIDs) from the domain object.
 * It iterates through the security groups in the domain, extracts account IDs from the 'shared' property,
 * and returns a unique list of numbers.
 *
 * @param domain - The domain object from Onyx
 * @returns An array of unique member account IDs
 */
function memberAccountIDsSelector(domain: OnyxEntry<Domain>): number[] {
    if (!domain) {
        return getEmptyArray<number>();
    }

    const memberIDs = Object.entries(domain).reduce<number[]>((acc, [key, value]) => {
        if (key.startsWith(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX)) {
            const securityGroup = value as DomainSecurityGroup;

            const sharedMembers = securityGroup?.shared ?? {};

            for (const id of Object.keys(sharedMembers)) {
                const accountID = Number(id);
                if (!Number.isNaN(accountID)) {
                    acc.push(accountID);
                }
            }
        }
        return acc;
    }, []);

    const uniqueIDs = [...new Set(memberIDs)];

    return uniqueIDs.length > 0 ? uniqueIDs : getEmptyArray<number>();
}

/**
 * Type guard to check if a domain entry is a security group entry.
 */
function isSecurityGroupEntry(entry: [string, unknown]): entry is [SecurityGroupKey, DomainSecurityGroup] {
    const [key, value] = entry;
    return key.startsWith(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX) && typeof value === 'object' && value !== null && 'shared' in value;
}
/**
 * Creates a selector function to get all security groups for a specific account ID.
 * The returned function searches through a domain and returns groups where
 * the account ID is present in the 'shared' property.
 *
 * @param accountID - The account ID to filter by
 * @returns A function that takes a domain and returns the filtered keys and security group data
 */
function selectSecurityGroupsForAccount(accountID: number) {
    return (domain: Domain | undefined): SecurityGroupsData => {
        if (!domain) {
            return {keys: [], securityGroups: {}};
        }

        const accountIDStr = String(accountID);
        const keys: SecurityGroupKey[] = [];
        const securityGroups: PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>> = {};

        for (const entry of Object.entries(domain)) {
            if (!isSecurityGroupEntry(entry)) {
                continue;
            }

            const [key, group] = entry;

            if (group.shared && accountIDStr in group.shared) {
                keys.push(key);
                securityGroups[key] = group;
            }
        }

        return {keys, securityGroups};
    };
}

const memberPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.members ?? {};

const adminPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.admin ?? {};

const defaultSecurityGroupIDSelector = (domain: OnyxEntry<Domain>) => domain?.domain_defaultSecurityGroupID;

export {
    domainMemberSamlSettingsSelector,
    domainSettingsPrimaryContactSelector,
    domainSamlSettingsStateSelector,
    domainNameSelector,
    metaIdentitySelector,
    adminAccountIDsSelector,
    memberAccountIDsSelector,
    domainEmailSelector,
    adminPendingActionSelector,
    technicalContactSettingsSelector,
    defaultSecurityGroupIDSelector,
    selectSecurityGroupsForAccount,
    memberPendingActionSelector,
    isSecurityGroupEntry,
};
