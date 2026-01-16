import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {CardFeeds, Domain, DomainPendingActions, DomainSecurityGroup, DomainSettings, SamlMetadata} from '@src/types/onyx';
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
 * Gets all security group IDs for a given account ID.
 * It searches through all security groups in the domain and returns the group IDs
 * where the account ID appears in the 'shared' property.
 *
 * @param domain - The domain object from Onyx
 * @param accountID - The account ID to search for
 * @returns An array of security group IDs that the account belongs to
 */
function selectSecurityGroupIDsForAccount(domain: Domain | undefined, accountID: number): number[] {
    if (!domain) {
        return [];
    }

    const accountIDStr = String(accountID);

    return Object.entries(domain)
        .filter(([key]) => key.startsWith(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX))
        .filter(([, value]) => {
            const groupData = value as {shared?: Record<string, string>};
            return groupData?.shared && accountIDStr in groupData.shared;
        })
        .map(([key]) => {
            // Extract the group ID from the key: "domain_securityGroup_<groupID>" -> "<groupID>"
            return parseInt(key.replace(`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}`, ''), 10);
        });
}

const memberPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.members ?? {};

const adminPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.admin ?? {};

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
    selectSecurityGroupIDsForAccount,
    memberPendingActionSelector,
};
