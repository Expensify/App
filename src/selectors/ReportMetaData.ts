import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

const pendingDeleteMemberAccountIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => getPendingDeleteMemberAccountIDs(reportMetadata?.pendingChatMembers);

// Returned whenever nothing is pending, so every subscriber in that state gets the same reference.
const NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS: Readonly<Record<string, string[]>> = Object.freeze({});

// Single-entry cache keyed on the collection reference, so every subscriber gets the same result while the collection
// is unchanged. Onyx hands every collection subscriber the same snapshot and rebuilds it only when a member changes
// (OnyxCache.getCollectionData in react-native-onyx).
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
    cachedPendingDeleteMemberAccountIDsByReportID = Object.keys(result).length > 0 ? result : NO_PENDING_DELETE_MEMBER_ACCOUNT_IDS;
    return cachedPendingDeleteMemberAccountIDsByReportID;
};

const pendingExpenseActionSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingExpenseAction: reportMetadata.pendingExpenseAction} : undefined;

/** The metadata fields an LHN row's option data reads: members pending removal and a pending DEW submit or approve. */
const optionRowReportMetadataSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers, pendingExpenseAction: reportMetadata.pendingExpenseAction} : undefined;

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingNewTransactionIDs;

const isOptimisticReportSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isOptimisticReport;

export {
    isActionLoadingSelector,
    hasOnceLoadedReportActionsSelector,
    reportActionsLoadingStateSelector,
    reportActionsListLoadingStateSelector,
    isLoadingInitialReportActionsSelector,
    isOptimisticReportSelector,
    pendingNewTransactionIDsSelector,
    pendingChatMembersSelector,
    pendingExpenseActionSelector,
    optionRowReportMetadataSelector,
    pendingDeleteMemberAccountIDsSelector,
    pendingDeleteMemberAccountIDsByReportIDSelector,
};
