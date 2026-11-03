/**
 * Workspace domain names, admin email domains, and the workspace a card or card feed belongs to.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import {isPublicDomain} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {isExpensifyTeam} from './members';

function getDomainNameForPolicy(policyID?: string): string {
    if (!policyID) {
        return '';
    }

    return `${CONST.EXPENSIFY_POLICY_DOMAIN}${policyID.toLowerCase()}${CONST.EXPENSIFY_POLICY_DOMAIN_EXTENSION}`;
}

function getAdminsPrivateEmailDomains(policy?: Policy) {
    if (!policy) {
        return [];
    }

    const adminDomains = Object.entries(policy.employeeList ?? {}).reduce((domains, [email, employee]) => {
        if (employee.role !== CONST.POLICY.ROLE.ADMIN) {
            return domains;
        }
        domains.push(Str.extractEmailDomain(email).toLowerCase());
        return domains;
    }, [] as string[]);

    const ownerDomains = policy.owner ? [Str.extractEmailDomain(policy.owner).toLowerCase()] : [];

    const privateDomains = [...new Set(adminDomains.concat(ownerDomains))].filter((domain) => !isPublicDomain(domain));

    // If the policy is not owned by Expensify there is no point in showing the domain for provisioning.
    if (!isExpensifyTeam(policy.owner)) {
        return privateDomains.filter((domain) => domain !== CONST.EXPENSIFY_PARTNER_NAME && domain !== CONST.EMAIL.GUIDES_DOMAIN);
    }

    return privateDomains;
}

/**
 * Determines the most frequent domain from the `acceptedDomains` list
 * that appears in the email addresses of policy members.
 *
 * @param acceptedDomains - List of domains to consider.
 * @param policy - The policy object.
 */
function getMostFrequentEmailDomain(acceptedDomains: string[], policy?: Policy) {
    if (!policy) {
        return undefined;
    }
    const domainOccurrences = {} as Record<string, number>;
    for (const memberDomain of Object.keys(policy.employeeList ?? {})
        .concat(policy.owner)
        .map((email) => Str.extractEmailDomain(email).toLowerCase())) {
        if (!acceptedDomains.includes(memberDomain)) {
            continue;
        }
        domainOccurrences[memberDomain] = (domainOccurrences[memberDomain] || 0) + 1;
    }
    let mostFrequent = {domain: '', count: 0};
    for (const [domain, count] of Object.entries(domainOccurrences)) {
        if (count <= mostFrequent.count) {
            continue;
        }
        mostFrequent = {domain, count};
    }
    if (mostFrequent.count === 0) {
        return undefined;
    }
    return mostFrequent.domain;
}

const getPolicyIDFromDomainName = (domainName: string): string | undefined => domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1]?.toUpperCase();

/**
 * Returns the workspace an assigned card belongs to.
 *
 * A card names its workspace with `fundID`, which is the policy's `policyAccountID`. That holds whatever the feed's
 * domain looks like, so a card on a company's own domain resolves the same workspace as one on a workspace feed's
 * `expensify-policy<ID>.exfy` domain. The domain is read only as a fallback, for a card that arrives without a `fundID`.
 */
const getPolicyForAssignedCard = (card: OnyxEntry<Pick<Card, 'domainName' | 'fundID'>>, policies: OnyxCollection<Policy>): OnyxEntry<Policy> => {
    const workspaceAccountID = Number(card?.fundID);
    const policyForFund = workspaceAccountID ? Object.values(policies ?? {}).find((policy) => policy?.policyAccountID === workspaceAccountID) : undefined;
    if (policyForFund) {
        return policyForFund;
    }

    const policyID = card?.domainName ? getPolicyIDFromDomainName(card.domainName) : undefined;
    return policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
};

const getDescriptionForPolicyDomainCard = (domainName: string, policies: OnyxCollection<Policy>): string => {
    // A domain name containing a policyID indicates that this is a workspace feed
    const policyID = getPolicyIDFromDomainName(domainName);
    if (policyID) {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        return policy?.name ?? domainName;
    }
    return domainName;
};

export {getDomainNameForPolicy, getAdminsPrivateEmailDomains, getMostFrequentEmailDomain, getPolicyIDFromDomainName, getPolicyForAssignedCard, getDescriptionForPolicyDomainCard};
