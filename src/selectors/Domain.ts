import {Str} from 'expensify-common';
import isObject from 'lodash/isObject';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {CardFeeds, Domain, DomainErrors, DomainPendingActions, DomainSecurityGroup, DomainSettings, SamlMetadata} from '@src/types/onyx';
import type {SecurityGroupKey, UserSecurityGroupData} from '@src/types/onyx/Domain';
import type {DomainSecurityGroupErrors} from '@src/types/onyx/DomainErrors';
import type {DomainSecurityGroupPendingActions} from '@src/types/onyx/DomainPendingActions';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainSecurityGroupWithID = {
    id: string;
    details: DomainSecurityGroup;
};

const domainMemberSettingsSelector = (domainSettings: OnyxEntry<CardFeeds>) => domainSettings?.settings;

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

            for (const [id, memberValue] of Object.entries(sharedMembers)) {
                if (memberValue === null || memberValue === undefined) {
                    continue;
                }
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
    return key.startsWith(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX) && isObject(value) && 'shared' in value && isObject(value.shared);
}

/**
 * Creates a selector for a single security group for a specific account ID.
 * The returned function searches through a domain and returns a group where
 * the account ID is present in the 'shared' property.
 *
 * @param accountID - The account ID to filter by
 * @returns A function that takes a domain and returns the filtered key and security group data
 */
function selectSecurityGroupForAccount(accountID: number) {
    return (domain: OnyxEntry<Domain>): UserSecurityGroupData => {
        if (!domain) {
            return undefined;
        }

        const accountIDStr = String(accountID);

        for (const entry of Object.entries(domain)) {
            if (!isSecurityGroupEntry(entry)) {
                continue;
            }

            const [key, group] = entry;

            if (group.shared && accountIDStr in group.shared) {
                return {
                    key,
                    securityGroup: group,
                };
            }
        }

        return undefined;
    };
}

const memberPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.member ?? {};
/**
 * Get the vacation delegate for a specific member in a domain.
 *
 * @param accountID - The account ID of the domain member.
 */
function vacationDelegateSelector(accountID: number): (domain: OnyxEntry<Domain>) => BaseVacationDelegate | undefined {
    return (domain: OnyxEntry<Domain>) => domain?.[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${accountID}`];
}

const adminPendingActionSelector = (pendingAction: OnyxEntry<DomainPendingActions>) => pendingAction?.admin ?? {};

const defaultSecurityGroupIDSelector = (domain: OnyxEntry<Domain>) => domain?.domain_defaultSecurityGroupID;

/**
 * Creates a selector that finds a single security group by its ID.
 */
function selectGroupByID(groupID?: string) {
    return (domain: OnyxEntry<Domain>): DomainSecurityGroup | undefined => domain?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`];
}

function groupsSelector(domain: OnyxEntry<Domain>): DomainSecurityGroupWithID[] {
    if (!domain) {
        return getEmptyArray<DomainSecurityGroupWithID>();
    }

    const entries: Array<[string, unknown]> = Object.entries(domain);
    return entries.filter(isSecurityGroupEntry).map(([key, value]) => ({
        id: key.replace(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, ''),
        details: value,
    }));
}

const accountLockSelector = (accountID: number) => (domain: OnyxEntry<Domain>) => domain?.[`${CONST.DOMAIN.PRIVATE_LOCKED_ACCOUNT_PREFIX}${accountID}`];

/**
 * Creates a selector that checks if a given account ID is an admin of the domain.
 * It checks whether the account ID appears as a value in any expensify_adminPermissions_* entry.
 *
 * @param accountID - The account ID to check admin status for
 * @returns A selector function that takes a domain and returns boolean
 */
function isAdminSelector(accountID: number) {
    return (domain: OnyxEntry<Domain>): boolean => {
        if (!domain || !accountID) {
            return false;
        }

        return Object.entries(domain).some(
            ([key, value]) => key.startsWith(CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX) && value !== undefined && value !== null && Number(value) === accountID,
        );
    };
}

/** Creates a selector that extracts the pending action for a security group's setting */
function domainSecurityGroupSettingPendingActionSelector(settingName: keyof DomainSecurityGroupPendingActions, groupID?: string) {
    return (domainPendingActions: OnyxEntry<DomainPendingActions>) => {
        return domainPendingActions?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`]?.[settingName];
    };
}

/** Creates a selector that extracts the errors for a security group's setting */
function domainSecurityGroupSettingErrorsSelector(settingName: keyof DomainSecurityGroupErrors, groupID?: string) {
    return (domainErrors: OnyxEntry<DomainErrors>) => {
        return domainErrors?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`]?.[settingName];
    };
}

export {
    domainMemberSettingsSelector,
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
    selectSecurityGroupForAccount,
    memberPendingActionSelector,
    isSecurityGroupEntry,
    groupsSelector,
    vacationDelegateSelector,
    accountLockSelector,
    isAdminSelector,
    selectGroupByID,
    domainSecurityGroupSettingPendingActionSelector,
    domainSecurityGroupSettingErrorsSelector,
};

export {type DomainSecurityGroupWithID};
