import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {CardFeeds, Domain, DomainPendingActions, DomainSecurityGroup, DomainSettings, SamlMetadata} from '@src/types/onyx';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
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
 * Get the vacation delegate for a specific member in a domain.
 *
 * @param accountID - The account ID of the domain member.
 */
function vacationDelegateSelector(accountID: number): (domain: OnyxEntry<Domain>) => BaseVacationDelegate | undefined {
    return (domain: OnyxEntry<Domain>) => domain?.[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${accountID}`];
}

const domainEmailSelector = (domain: OnyxEntry<Domain>) => domain?.email;

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
    vacationDelegateSelector,
};
