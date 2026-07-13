import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';
import type {CardList, Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import type {CardProgramKey} from './CardUtils';

import {
    getConfiguredExpensifyCardProgramKeys,
    getDomainByFundID,
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

    /**
     * The program (US/GB) this entry represents. A single settings NVP can hold more than one provisioned program,
     * in which case each program gets its own entry (and its own selector row) that shares the same `fundID`.
     */
    programKey: CardProgramKey;
};

/** A feed qualifies only when its settings NVP has a US or GB program block with a configured settlement bank account. */
function hasConfiguredExpensifyCardFeed(settings: ExpensifyCardSettings | undefined): boolean {
    if (!settings) {
        return false;
    }

    // We only want to show feeds that have either a US or GB program.
    // TRAVEL feeds do not show in the UI and are managed on the backend and CURRENT feeds are deprecated and should not be used to determine if a feed is configured or not.
    for (const programKey of [CONST.COUNTRY.US, CONST.COUNTRY.GB] as const) {
        const nested = settings[programKey];
        if (nested && typeof nested === 'object' && !Array.isArray(nested) && nested.paymentBankAccountID != null) {
            return true;
        }
    }

    return false;
}

/**
 * Determines whether an Expensify card feed should be visible to the current user.
 *
 * A feed is gathered from one of two sources, regardless of its `linkedPolicyIDs`:
 *  1. The user is an admin of the domain whose account ID matches the feed's fundID.
 *  2. The user is an admin of a non-deleted policy whose `policyAccountID` matches the feed's
 *     fundID (i.e. the fund backs that workspace account).
 *
 * Whether the feed shows as an available feed or under "From other workspaces" is decided
 * separately by `isFeedPrimaryForPolicy` using `linkedPolicyIDs`. There is intentionally no
 * decision based on `preferredPolicy` (oldDot-only) nor on whether a card has been issued.
 */
function isExpensifyCardFeedVisibleToAdmin(
    settings: ExpensifyCardSettings,
    policies: OnyxCollection<Policy>,
    fundID: number,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
): boolean {
    if (!hasConfiguredExpensifyCardFeed(settings)) {
        return false;
    }

    // Source 1: the user is an admin of the domain whose ID matches the fundID.
    const domain = getDomainByFundID(domains, fundID);
    if (isAdminSelector(currentUserAccountID)(domain)) {
        return true;
    }

    // Source 2: the user is an admin of a non-deleted policy whose policyAccountID matches the fundID.
    return Object.values(policies ?? {}).some(
        (policy) => policy?.policyAccountID === fundID && isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

/** A feed shows as available for a policy when that policy is in the feed's `linkedPolicyIDs`; otherwise it shows under "From other workspaces". */
function isFeedPrimaryForPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    return isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings), policyID);
}

function getAdminExpensifyCardFeedEntries(
    cardSettingsCollection: OnyxCollection<ExpensifyCardSettings>,
    policies: OnyxCollection<Policy>,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
): ExpensifyCardFeedEntry[] {
    return Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
        if (!settings) {
            return [];
        }
        const fundID = getFundIdFromSettingsKey(settingsKey);
        if (!isExpensifyCardFeedVisibleToAdmin(settings, policies, fundID, domains, currentUserAccountID)) {
            return [];
        }

        // A domain provisioned with more than one program (e.g. both US and GB) yields one entry per program so each
        // renders as its own selector row. `getConfiguredExpensifyCardProgramKeys` only returns US/GB, both of which pass
        // the `hasConfiguredExpensifyCardFeed` gate above, so there is always at least one program here.
        return getConfiguredExpensifyCardProgramKeys(settings).map((programKey) => ({settingsKey, fundID, settings, programKey}));
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

    const domainEntry = getDomainByFundID(domains, fundID);
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
