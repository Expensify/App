import {parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';
import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

// Preserves the distinction between a missing loading-state entry (undefined) and an entry whose
// `hasOnceLoadedReportActions` is not yet true, unlike the plain field selector above.
const reportActionsLoadingStateSelector = (loadingState: OnyxEntry<ReportLoadingState>): Pick<ReportLoadingState, 'hasOnceLoadedReportActions'> | undefined =>
    loadingState ? {hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions} : undefined;

const reportActionsListLoadingStateSelector = (
    loadingState: OnyxEntry<ReportLoadingState>,
): Pick<ReportLoadingState, 'hasOnceLoadedReportActions' | 'isLoadingInitialReportActions' | 'isLoadingOlderReportActions' | 'hasLoadingOlderReportActionsError'> | undefined =>
    loadingState
        ? {
              hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions,
              isLoadingInitialReportActions: loadingState.isLoadingInitialReportActions,
              isLoadingOlderReportActions: loadingState.isLoadingOlderReportActions,
              hasLoadingOlderReportActionsError: loadingState.hasLoadingOlderReportActionsError,
          }
        : undefined;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const isLoadingReportStatusSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingReportStatus;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

const pendingDeleteMemberAccountIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => getPendingDeleteMemberAccountIDs(reportMetadata?.pendingChatMembers);

// Returned whenever nothing is pending, so every subscriber in that state gets the same reference.
const NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS: Readonly<Record<string, string[]>> = Object.freeze({});

// Single-entry cache keyed on the collection reference, so every subscriber gets the same result while the collection
// is unchanged. Onyx hands every collection subscriber the same snapshot and rebuilds it only when a member changes
// (OnyxCache.getCollectionData in react-native-onyx). A new snapshot with the same pending removals keeps the previous
// result, because the option list cache downstream compares its inputs by reference.
let cachedReportMetadataCollection: OnyxCollection<ReportMetadata>;
let cachedPendingDeleteMemberAccountIDsByReportID: Readonly<Record<string, string[]>> = NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS;

registerSessionCleanupCallback(() => {
    cachedReportMetadataCollection = undefined;
    cachedPendingDeleteMemberAccountIDsByReportID = NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS;
});

const pendingDeleteMemberAccountIDsByReportIDSelector = (reportMetadata: OnyxCollection<ReportMetadata>): Readonly<Record<string, string[]>> => {
    if (reportMetadata === cachedReportMetadataCollection) {
        return cachedPendingDeleteMemberAccountIDsByReportID;
    }

    const result: Record<string, string[]> = {};

    for (const [key, metadata] of Object.entries(reportMetadata ?? {})) {
        // Reports with no pending members at all are the overwhelming majority, so skip them before doing any work.
        if (!metadata?.pendingChatMembers?.length) {
            continue;
        }

        const pendingDeleteMemberAccountIDs = getPendingDeleteMemberAccountIDs(metadata.pendingChatMembers);
        if (pendingDeleteMemberAccountIDs.length === 0) {
            continue;
        }

        result[key.replace(ONYXKEYS.COLLECTION.REPORT_METADATA, '')] = pendingDeleteMemberAccountIDs;
    }

    cachedReportMetadataCollection = reportMetadata;
    if (Object.keys(result).length === 0) {
        cachedPendingDeleteMemberAccountIDsByReportID = NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS;
    } else if (!deepEqual(result, cachedPendingDeleteMemberAccountIDsByReportID)) {
        cachedPendingDeleteMemberAccountIDsByReportID = result;
    }
    return cachedPendingDeleteMemberAccountIDsByReportID;
};

type PendingNewTransactions = {
    /** Transaction ID to the flag to sweep once shown. The newest flag wins. */
    activeFlagKeys: Record<string, string>;
    /** Flags to sweep without showing: stale, unreadable or superseded. */
    expiredFlagKeys: string[];
};

/** Runs on mount and when this report's metadata changes, not on a timer. So a reopened report drops a stale flag, while a consumer already waiting to show one keeps it until then. */
const pendingNewTransactionsSelector = (reportMetadata: OnyxEntry<ReportMetadata>): PendingNewTransactions | undefined => {
    const storedFlags = reportMetadata?.pendingNewTransactionIDs;
    if (!storedFlags) {
        return undefined;
    }
    const now = Date.now();
    const activeFlagKeys: Record<string, string> = {};
    const activeStamps: Record<string, number> = {};
    const expiredFlagKeys: string[] = [];
    for (const [flagKey, isFlagged] of Object.entries(storedFlags)) {
        if (!isFlagged) {
            continue;
        }
        const flag = parsePendingNewTransactionFlagKey(flagKey);
        if (!flag) {
            expiredFlagKeys.push(flagKey);
            continue;
        }
        const {transactionID, flaggedAt} = flag;
        const age = now - flaggedAt;
        // A stamp ahead of the clock would never age out.
        if (age < 0 || age >= CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW) {
            expiredFlagKeys.push(flagKey);
            continue;
        }
        const previousFlagKey = activeFlagKeys[transactionID];
        if (previousFlagKey === undefined) {
            activeFlagKeys[transactionID] = flagKey;
            activeStamps[transactionID] = flaggedAt;
            continue;
        }
        const [newerFlagKey, olderFlagKey] = flaggedAt >= activeStamps[transactionID] ? [flagKey, previousFlagKey] : [previousFlagKey, flagKey];
        activeFlagKeys[transactionID] = newerFlagKey;
        activeStamps[transactionID] = Math.max(flaggedAt, activeStamps[transactionID]);
        expiredFlagKeys.push(olderFlagKey);
    }
    if (!Object.keys(activeFlagKeys).length && !expiredFlagKeys.length) {
        return undefined;
    }
    return {activeFlagKeys, expiredFlagKeys};
};

const pendingExpenseActionSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingExpenseAction: reportMetadata.pendingExpenseAction} : undefined;

/** The metadata fields an LHN row's option data reads: members pending removal and a pending DEW submit or approve. */
const optionRowReportMetadataSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers, pendingExpenseAction: reportMetadata.pendingExpenseAction} : undefined;

const isOptimisticReportSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isOptimisticReport;

export {
    isActionLoadingSelector,
    hasOnceLoadedReportActionsSelector,
    reportActionsLoadingStateSelector,
    reportActionsListLoadingStateSelector,
    isLoadingInitialReportActionsSelector,
    isLoadingReportStatusSelector,
    isOptimisticReportSelector,
    pendingNewTransactionsSelector,
    pendingChatMembersSelector,
    pendingExpenseActionSelector,
    optionRowReportMetadataSelector,
    pendingDeleteMemberAccountIDsSelector,
    pendingDeleteMemberAccountIDsByReportIDSelector,
};
export type {PendingNewTransactions};
