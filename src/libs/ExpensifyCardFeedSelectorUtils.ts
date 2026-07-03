import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';
import type {CardList, Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {
    getDomainNameFromExpensifyCardSettings,
    getFundIdFromSettingsKey,
    getLinkedPolicyIDsFromExpensifyCardSettings,
    getPreferredPolicyFromExpensifyCardSettings,
    isPolicyIDInLinkedExpensifyCardPolicyList,
} from './CardUtils';
import {getDescriptionForPolicyDomainCard, isPolicyAdmin} from './PolicyUtils';

type ExpensifyCardFeedEntry = {
    settingsKey: string;
    fundID: number;
    settings: ExpensifyCardSettings;
};

function hasLoadedExpensifyCardSettings(settings: ExpensifyCardSettings | undefined): boolean {
    return !!settings && Object.keys(settings).length > 1;
}

/**
 * Determines whether an Expensify card feed should be visible to the current user.
 *
 * The function uses a fallback chain to decide visibility:
 *  1. If the feed has `linkedPolicyIDs`, show it when the user is an admin of at least one
 *     linked policy that is not pending deletion.
 *  2. Otherwise, if the feed has a `preferredPolicy`, show it when the user is an admin of
 *     that policy and the policy is not pending deletion.
 *  3. Otherwise (orphan feed with neither linkedPolicyIDs nor preferredPolicy):
 *     Only surface it when the fund has an issued Expensify Card. Workspaces that merely have
 *     the feature enabled (no card) would otherwise each produce a feed that resolves to the
 *     same domain name, showing as duplicate entries in the selector. Among feeds that pass
 *     that gate:
 *     a. Show it if the user is a domain admin for the domain whose ID matches the fundID.
 *     b. Show it if any non-deleted policy the user administers has a `policyAccountID`
 *        equal to the fundID (i.e. the fund backs that workspace).
 */
function isExpensifyCardFeedVisibleToAdmin(
    settings: ExpensifyCardSettings,
    policies: OnyxCollection<Policy>,
    fundID: number,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
    cardList: CardList | undefined,
): boolean {
    if (!hasLoadedExpensifyCardSettings(settings)) {
        return false;
    }
    const linkedPolicyIDs = getLinkedPolicyIDsFromExpensifyCardSettings(settings);
    if (linkedPolicyIDs?.length) {
        return linkedPolicyIDs.some((linkedPolicyID) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${linkedPolicyID.toUpperCase()}`];
            return isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        });
    }
    const preferredPolicy = getPreferredPolicyFromExpensifyCardSettings(settings);
    if (preferredPolicy) {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicy.toUpperCase()}`];
        return isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    }

    const hasIssuedExpensifyCard = Object.values(cardList ?? {}).some((card) => card?.fundID === fundID.toString() && card?.bank === CONST.EXPENSIFY_CARD.BANK);
    if (!hasIssuedExpensifyCard) {
        return false;
    }

    const domain = domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`] ?? Object.values(domains ?? {}).find((entry) => entry?.accountID === fundID);
    if (isAdminSelector(currentUserAccountID)(domain)) {
        return true;
    }

    return Object.values(policies ?? {}).some(
        (policy) => policy?.policyAccountID === fundID && isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

function isFeedLinkedToPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    return isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings), policyID);
}

function isFeedForCurrentWorkspace(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    const preferred = getPreferredPolicyFromExpensifyCardSettings(entry.settings);
    return preferred?.toUpperCase() === policyID.toUpperCase();
}

/** Primary vs other: use linkedPolicyIDs when present; otherwise preferredPolicy (legacy). */
function isFeedPrimaryForPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    const linked = getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings);
    if (linked?.length) {
        return isFeedLinkedToPolicy(entry, policyID);
    }
    return isFeedForCurrentWorkspace(entry, policyID);
}

function getAdminExpensifyCardFeedEntries(
    cardSettingsCollection: OnyxCollection<ExpensifyCardSettings>,
    policies: OnyxCollection<Policy>,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
    cardList: CardList | undefined,
): ExpensifyCardFeedEntry[] {
    return Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
        if (!settings) {
            return [];
        }
        const fundID = getFundIdFromSettingsKey(settingsKey);
        if (!isExpensifyCardFeedVisibleToAdmin(settings, policies, fundID, domains, currentUserAccountID, cardList)) {
            return [];
        }
        return [{settingsKey, fundID, settings}];
    });
}

function partitionExpensifyCardFeedsForSelector(entries: ExpensifyCardFeedEntry[], policyID: string): {primary: ExpensifyCardFeedEntry[]; other: ExpensifyCardFeedEntry[]} {
    if (entries.length === 0) {
        return {primary: [], other: []};
    }
    const primary = entries.filter((e) => isFeedPrimaryForPolicy(e, policyID));
    const other = entries.filter((e) => !isFeedPrimaryForPolicy(e, policyID));
    return {primary, other};
}

function getExpensifyCardFeedDescription(
    cardSettings: OnyxEntry<ExpensifyCardSettings>,
    policies: OnyxCollection<Policy>,
    domains?: OnyxCollection<Domain>,
    fundID?: number,
    cardList?: CardList,
): string {
    const domainNameFromSettings = getDomainNameFromExpensifyCardSettings(cardSettings);
    if (domainNameFromSettings) {
        return getDescriptionForPolicyDomainCard(domainNameFromSettings, policies);
    }

    const linkedPolicyIDs = getLinkedPolicyIDsFromExpensifyCardSettings(cardSettings);
    const preferredPolicyID = getPreferredPolicyFromExpensifyCardSettings(cardSettings);
    const policyIDForName = linkedPolicyIDs?.length ? linkedPolicyIDs.at(0) : preferredPolicyID;
    const policyName = policyIDForName && policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDForName.toUpperCase()}`]?.name;
    if (policyName) {
        return policyName;
    }

    if (!fundID) {
        return '';
    }

    const domainEntry = domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`] ?? Object.values(domains ?? {}).find((entry) => entry?.accountID === fundID);
    if (domainEntry?.email) {
        return getDescriptionForPolicyDomainCard(Str.extractEmailDomain(domainEntry.email), policies);
    }

    const cardDomainName = Object.values(cardList ?? {}).find((card) => card?.fundID === fundID.toString() && card.bank === CONST.EXPENSIFY_CARD.BANK)?.domainName;
    if (cardDomainName) {
        return getDescriptionForPolicyDomainCard(cardDomainName, policies);
    }

    const policyOwner = Object.values(policies ?? {}).find((policy) => policy?.policyAccountID === fundID)?.owner;
    return policyOwner ? getDescriptionForPolicyDomainCard(Str.extractEmailDomain(policyOwner), policies) : '';
}

export {getAdminExpensifyCardFeedEntries, getExpensifyCardFeedDescription, partitionExpensifyCardFeedsForSelector, type ExpensifyCardFeedEntry};
