import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

let allPersonalDetails: OnyxTypes.PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

let allTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (value) => {
        if (!value) {
            allTransactions = {};
            return;
        }

        allTransactions = value;
    },
});

let allTransactionDrafts: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

// TODO: https://github.com/Expensify/App/issues/66512
let allTransactionViolations: NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: (value) => {
        if (!value) {
            allTransactionViolations = {};
            return;
        }

        allTransactionViolations = value;
    },
});

let allPolicyTags: OnyxCollection<OnyxTypes.PolicyTagLists> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
    },
});

let allReportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

let deprecatedUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        deprecatedUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let deprecatedCurrentUserPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        deprecatedCurrentUserPersonalDetails = value?.[deprecatedUserAccountID] ?? undefined;
    },
});

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});

// Use connectWithoutView because this is created for non-UI task only
let recentAttendees: OnyxEntry<Attendee[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
    callback: (value) => (recentAttendees = value),
});

let searchQueryByHash: Record<string, string> = {};
Onyx.connect({
    key: ONYXKEYS.SEARCH_QUERY_BY_HASH,
    callback: (value) => {
        searchQueryByHash = value ?? {};
    },
});

let allSnapshots: OnyxCollection<OnyxTypes.SearchResults> = {};
let knownSnapshotHashes = new Set<string>();
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SNAPSHOT,
    callback: (value) => {
        allSnapshots = value ?? {};
        // Keep SEARCH_QUERY_BY_HASH bounded by mirroring the snapshot collection's lifecycle:
        // when a snapshot disappears, drop its query entry so the map can never outgrow it.
        const snapshotPrefixLength = ONYXKEYS.COLLECTION.SNAPSHOT.length;
        const currentHashes = new Set(Object.keys(allSnapshots).map((k) => k.slice(snapshotPrefixLength)));
        // Reconcile against persisted SEARCH_QUERY_BY_HASH too, so entries whose snapshots were evicted
        // before this JS session get pruned on first sync (not just hashes seen since startup).
        const candidates = new Set<string>([...knownSnapshotHashes, ...Object.keys(searchQueryByHash)]);
        const removed = [...candidates].filter((h) => !currentHashes.has(h));
        if (removed.length > 0) {
            const evictions: Record<string, string | null> = {};
            for (const h of removed) {
                evictions[h] = null;
            }
            Onyx.merge(ONYXKEYS.SEARCH_QUERY_BY_HASH, evictions);
        }
        knownSnapshotHashes = currentHashes;
    },
});

function getAllPersonalDetails(): OnyxTypes.PersonalDetailsList {
    return allPersonalDetails;
}

function getAllTransactions(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactions;
}

/**
 * @deprecated Use `useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS)` in components and pass the data down as a parameter instead.
 */
// TODO: https://github.com/Expensify/App/issues/66512
function getAllTransactionViolations(): NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> {
    return allTransactionViolations;
}

function getAllReports(): OnyxCollection<OnyxTypes.Report> {
    return allReports;
}

function getAllReportActionsFromIOU(): OnyxCollection<OnyxTypes.ReportActions> {
    return allReportActions;
}

function getAllReportNameValuePairs(): OnyxCollection<OnyxTypes.ReportNameValuePairs> {
    return allReportNameValuePairs;
}

function getAllTransactionDrafts(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactionDrafts;
}

function getCurrentUserPersonalDetails(): OnyxEntry<OnyxTypes.PersonalDetails> {
    return deprecatedCurrentUserPersonalDetails;
}

function getRecentAttendees(): OnyxEntry<Attendee[]> {
    return recentAttendees;
}

function getAllSnapshots(): OnyxCollection<OnyxTypes.SearchResults> {
    return allSnapshots;
}

function getSearchQueryByHash(): Record<string, string> {
    return searchQueryByHash;
}

/**
 * This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTags` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with params passed to the functions or useOnyx hook in React components.
 */
function getPolicyTags(): OnyxCollection<OnyxTypes.PolicyTagLists> {
    return allPolicyTags;
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `buildParticipantsPolicyTags` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with params passed to the functions or useOnyx hook in React components.
 */
function buildParticipantsPolicyTags(participants: Participant[]): OnyxTypes.ParticipantsPolicyTags {
    return participants.reduce<OnyxTypes.ParticipantsPolicyTags>((acc, participant) => {
        if (participant.policyID) {
            const tags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${participant.policyID}`];
            if (tags) {
                acc[participant.policyID] = tags;
            }
        }
        return acc;
    }, {});
}

export {
    getAllPersonalDetails,
    getAllTransactions,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getAllTransactionViolations,
    getAllReports,
    getAllReportActionsFromIOU,
    getAllReportNameValuePairs,
    getAllTransactionDrafts,
    getCurrentUserPersonalDetails,
    getRecentAttendees,
    getAllSnapshots,
    getSearchQueryByHash,
    // TODO: Replace buildParticipantsPolicyTags (https://github.com/Expensify/App/issues/72721) with useOnyx hook
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    buildParticipantsPolicyTags,
    getPolicyTags,
};
