import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {convertAttendeesToArray} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedParentAction, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {isDM, isIOUReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasOnceLoadedReportActionsSelector, isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {OriginalMessageIOU, Policy, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

function getSplitAuthor(transaction: Transaction, splits?: Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>) {
    const {originalTransactionID, source} = transaction.comment ?? {};

    if (source !== CONST.IOU.TYPE.SPLIT || originalTransactionID === undefined) {
        return undefined;
    }

    const splitAction = splits?.find((split) => getOriginalMessage(split)?.IOUTransactionID === originalTransactionID);

    if (!splitAction) {
        return undefined;
    }

    return splitAction.actorAccountID;
}

const getIOUActionsSelector = (actions: OnyxEntry<ReportActions>): ReportAction[] => {
    return Object.values(actions ?? {}).filter(isMoneyRequestAction);
};

const getSplitsSelector = (actions: OnyxEntry<ReportActions>): Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> => {
    return Object.values(actions ?? {})
        .filter(isMoneyRequestAction)
        .filter((act) => getOriginalMessage(act)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT);
};

function getTransactionDirectionSign(transaction: Transaction): number | undefined {
    if (transaction.amount !== 0) {
        return Math.sign(transaction.amount);
    }

    const modifiedAmount = Number(transaction.modifiedAmount);

    if (Number.isFinite(modifiedAmount) && modifiedAmount !== 0) {
        return Math.sign(modifiedAmount);
    }

    return undefined;
}

function hasPendingScanStateAndUnknownDirection(transaction: Transaction): boolean {
    if (transaction.receipt?.source === undefined) {
        return false;
    }

    if (transaction.receipt?.state !== CONST.IOU.RECEIPT_STATE.SCAN_READY && transaction.receipt?.state !== CONST.IOU.RECEIPT_STATE.SCANNING) {
        return false;
    }

    if (getTransactionDirectionSign(transaction) !== undefined) {
        return false;
    }

    return true;
}

function hasReceiptBackedUnknownDirection(transaction: Transaction): boolean {
    return transaction.receipt?.source !== undefined && getTransactionDirectionSign(transaction) === undefined;
}

function hasNonPendingReceiptBackedUnknownDirection(transaction: Transaction): boolean {
    return hasReceiptBackedUnknownDirection(transaction) && !hasPendingScanStateAndUnknownDirection(transaction);
}

function normalizeAccountID(accountID: number | string | undefined): number | undefined {
    const parsedAccountID = Number(accountID);

    if (!Number.isFinite(parsedAccountID) || parsedAccountID <= 0) {
        return undefined;
    }

    return parsedAccountID;
}

function getAttendeeIdentifier(attendee: {accountID?: number; email?: string; login?: string; reportID?: string; displayName?: string; text?: string}): number | string | undefined {
    if (attendee.accountID !== undefined) {
        return attendee.accountID;
    }

    if (attendee.email) {
        return attendee.email.toLowerCase();
    }

    if (attendee.login) {
        return attendee.login.toLowerCase();
    }

    if (attendee.reportID) {
        return attendee.reportID;
    }

    if (attendee.displayName) {
        return attendee.displayName.toLowerCase();
    }

    if (attendee.text) {
        return attendee.text.toLowerCase();
    }

    return undefined;
}

function getAccountIDFromTransactionDirection(transaction: Transaction, action: OnyxEntry<ReportAction>, iouReport: OnyxEntry<Report>): number | undefined {
    const directionSign = getTransactionDirectionSign(transaction);

    if (directionSign === undefined) {
        return undefined;
    }

    return directionSign > 0 ? normalizeAccountID(action?.childOwnerAccountID ?? iouReport?.ownerAccountID) : normalizeAccountID(action?.childManagerAccountID ?? iouReport?.managerID);
}

function getLastActorAccountIDForReceiptBackedUnknown(
    transaction: Transaction,
    action: OnyxEntry<ReportAction>,
    chatReport: OnyxEntry<Report>,
    iouReport: OnyxEntry<Report>,
    receiptBackedUnknownTransactionCount: number,
): number | undefined {
    if (hasPendingScanStateAndUnknownDirection(transaction)) {
        const previewLastActorAccountID = normalizeAccountID(action?.childLastActorAccountID);

        if (previewLastActorAccountID !== undefined) {
            return previewLastActorAccountID;
        }

        const chatLastActorAccountID = normalizeAccountID(chatReport?.lastActorAccountID);

        if (chatLastActorAccountID !== undefined && chatLastActorAccountID !== CONST.ACCOUNT_ID.CONCIERGE) {
            return chatLastActorAccountID;
        }

        return normalizeAccountID(iouReport?.lastActorAccountID);
    }

    if (!hasNonPendingReceiptBackedUnknownDirection(transaction) || receiptBackedUnknownTransactionCount !== 1) {
        return undefined;
    }

    return normalizeAccountID(action?.childLastActorAccountID ?? iouReport?.lastActorAccountID);
}

function shouldBackfillReceiptBackedUnknownTransactions(
    transactions: Transaction[] | undefined,
    transactionActorAccountIDs: Array<number | undefined> | undefined,
    fallbackActorAccountID: number | undefined,
): fallbackActorAccountID is number {
    if (!transactions || !transactionActorAccountIDs || fallbackActorAccountID === undefined) {
        return false;
    }

    const knownActorAccountIDs = transactionActorAccountIDs.filter((accountID): accountID is number => accountID !== undefined);
    if (knownActorAccountIDs.length === 0 || knownActorAccountIDs.some((accountID) => accountID !== fallbackActorAccountID)) {
        return false;
    }

    const transactionsMissingActor = transactions.filter((transaction, index) => transactionActorAccountIDs.at(index) === undefined);
    return transactionsMissingActor.length > 0 && transactionsMissingActor.every(hasNonPendingReceiptBackedUnknownDirection);
}

function canInferFromTransactionsDuringPartialHydration(
    transactions: Transaction[] | undefined,
    transactionActorAccountIDs: Array<number | undefined> | undefined,
    fallbackActorAccountID: number | undefined,
    childRecentReceiptTransactionIDs: Record<string, string> | undefined,
    missingTransactionCount: number,
): boolean {
    if (!transactions || !transactionActorAccountIDs || fallbackActorAccountID === undefined || missingTransactionCount < 1) {
        return false;
    }

    const uniqueKnownActorAccountIDs = new Set(transactionActorAccountIDs.filter((accountID): accountID is number => accountID !== undefined));

    if (uniqueKnownActorAccountIDs.size !== 1 || uniqueKnownActorAccountIDs.has(fallbackActorAccountID) === false) {
        return false;
    }

    if (transactions.some((transaction, index) => transactionActorAccountIDs.at(index) === undefined && !hasNonPendingReceiptBackedUnknownDirection(transaction))) {
        return false;
    }

    return Object.keys(childRecentReceiptTransactionIDs ?? {}).length >= missingTransactionCount;
}

function shouldPreferFallbackActorForReceiptBackedUnknownTransactions(
    transactions: Transaction[] | undefined,
    directionBasedActorAccountIDs: Array<number | undefined> | undefined,
    fallbackActorAccountID: number | undefined,
    hasCompleteActionCoverage: boolean,
): fallbackActorAccountID is number {
    if (!transactions || !directionBasedActorAccountIDs || fallbackActorAccountID === undefined || hasCompleteActionCoverage) {
        return false;
    }

    if (transactions.some(hasPendingScanStateAndUnknownDirection)) {
        return false;
    }

    const knownDirectionActorAccountIDs = transactions
        .map((transaction, index) => ({transaction, actorAccountID: directionBasedActorAccountIDs.at(index)}))
        .filter(({transaction, actorAccountID}) => !hasReceiptBackedUnknownDirection(transaction) && actorAccountID !== undefined)
        .map(({actorAccountID}) => actorAccountID);

    return knownDirectionActorAccountIDs.length > 0 && knownDirectionActorAccountIDs.every((accountID) => accountID === fallbackActorAccountID);
}

function isExplicitlyDeletedIOUAction(iouAction: ReportAction): boolean {
    const originalMessage = getOriginalMessage(iouAction) as OriginalMessageIOU | undefined;

    if (iouAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || originalMessage?.deleted || isDeletedParentAction(iouAction)) {
        return true;
    }

    const message = iouAction.message;

    if (Array.isArray(message)) {
        return message.length === 0 || message.some((fragment) => !!fragment?.deleted || (fragment?.html === '' && !iouAction.isOptimisticAction));
    }

    return !!message?.deleted || (message?.html === '' && !iouAction.isOptimisticAction);
}

type GetReportPreviewSenderIDParams = {
    iouReport: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
    chatReport: OnyxEntry<Report>;
    iouActions: ReportAction[] | undefined;
    transactions: Transaction[] | undefined;
    splits: Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> | undefined;
    policy: OnyxEntry<Policy>;
    currentUserAccountID: number;
    hasFinishedInitialReportActionsLoad?: boolean;
};

function getReportPreviewSenderID({
    iouReport,
    action,
    chatReport,
    iouActions,
    transactions,
    splits,
    policy,
    currentUserAccountID,
    hasFinishedInitialReportActionsLoad,
}: GetReportPreviewSenderIDParams): number | undefined {
    const isOptimisticReportPreview = action?.isOptimisticAction && action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isIOUReport(iouReport);

    if (isOptimisticReportPreview) {
        return currentUserAccountID;
    }
    const loadedTransactionCount = transactions?.length ?? 0;
    const childMoneyRequestCount = action?.childMoneyRequestCount ?? 0;
    const activeMoneyRequestCount = iouReport?.transactionCount ?? childMoneyRequestCount;
    const activeIOUActions = iouActions?.filter((iouAction) => !isExplicitlyDeletedIOUAction(iouAction)) ?? [];
    const uniqueIOUActionActorMap = new Map<string, number>();

    for (const iouAction of activeIOUActions) {
        const iouTransactionID = (getOriginalMessage(iouAction) as OriginalMessageIOU | undefined)?.IOUTransactionID;

        if (!iouTransactionID || iouAction.actorAccountID === undefined) {
            continue;
        }

        uniqueIOUActionActorMap.set(iouTransactionID, iouAction.actorAccountID);
    }

    const hasCompleteActionCoverage = activeMoneyRequestCount > 0 && uniqueIOUActionActorMap.size >= activeMoneyRequestCount;
    const areAllActiveChildRequestsCreatedByOneActor = uniqueIOUActionActorMap.size > 0 && new Set(uniqueIOUActionActorMap.values()).size < 2;
    const canInferFromIOUActionsDuringPartialHydration = loadedTransactionCount > 0 && hasCompleteActionCoverage && activeIOUActions.length > 0 && areAllActiveChildRequestsCreatedByOneActor;
    const attendeeIdentifierGroups =
        transactions?.map((transaction) =>
            convertAttendeesToArray(transaction.comment?.attendees)
                .map((attendee) =>
                    transaction.comment?.source === CONST.IOU.TYPE.SPLIT
                        ? getSplitAuthor(transaction, splits)
                        : (getPersonalDetailByEmail(attendee.email)?.accountID ?? getAttendeeIdentifier(attendee)),
                )
                .filter((identifier): identifier is number | string => !!identifier),
        ) ?? [];
    const transactionSigns = transactions?.map((transaction) => getTransactionDirectionSign(transaction)) ?? [];
    const hasAttendeeIdentifierForEachTransaction =
        transactions === undefined || (attendeeIdentifierGroups.length === transactions.length && attendeeIdentifierGroups.every((identifiers) => identifiers.length > 0));
    const receiptBackedUnknownTransactionCount = transactions?.filter(hasReceiptBackedUnknownDirection).length ?? 0;
    const missingTransactionCount = Math.max(activeMoneyRequestCount - loadedTransactionCount, 0);
    const receiptBackedUnknownFallbackActorAccountID = normalizeAccountID(action?.childLastActorAccountID ?? iouReport?.lastActorAccountID);
    const directionBasedActorAccountIDs = transactions?.map((transaction) => getAccountIDFromTransactionDirection(transaction, action, iouReport)) ?? [];
    const shouldPreferFallbackActorForReceiptBackedUnknown = shouldPreferFallbackActorForReceiptBackedUnknownTransactions(
        transactions,
        directionBasedActorAccountIDs,
        receiptBackedUnknownFallbackActorAccountID,
        hasCompleteActionCoverage,
    );
    const initialTransactionActorAccountIDs =
        transactions?.map(
            (transaction, index) =>
                (shouldPreferFallbackActorForReceiptBackedUnknown && hasReceiptBackedUnknownDirection(transaction)
                    ? receiptBackedUnknownFallbackActorAccountID
                    : getIOUActionForTransactionID(activeIOUActions, transaction.transactionID)?.actorAccountID) ??
                directionBasedActorAccountIDs.at(index) ??
                getLastActorAccountIDForReceiptBackedUnknown(transaction, action, chatReport, iouReport, receiptBackedUnknownTransactionCount),
        ) ?? [];
    const transactionActorAccountIDs = shouldBackfillReceiptBackedUnknownTransactions(transactions, initialTransactionActorAccountIDs, receiptBackedUnknownFallbackActorAccountID)
        ? initialTransactionActorAccountIDs.map((accountID) => accountID ?? receiptBackedUnknownFallbackActorAccountID)
        : initialTransactionActorAccountIDs;
    const hasActorAccountIDForEachTransaction =
        !!transactionActorAccountIDs && transactionActorAccountIDs.length > 0 && transactionActorAccountIDs.every((accountID) => accountID !== undefined);
    const canInferFromTransactionDataDuringPartialHydration = canInferFromTransactionsDuringPartialHydration(
        transactions,
        transactionActorAccountIDs,
        receiptBackedUnknownFallbackActorAccountID,
        action?.childRecentReceiptTransactionIDs,
        missingTransactionCount,
    );
    if (!hasFinishedInitialReportActionsLoad && missingTransactionCount > 0 && !canInferFromIOUActionsDuringPartialHydration && !canInferFromTransactionDataDuringPartialHydration) {
        return undefined;
    }

    // 1. Use the transaction creator when it can be inferred for every transaction.
    if (hasActorAccountIDForEachTransaction) {
        const areAllTransactionsCreatedByOneActor = new Set(transactionActorAccountIDs).size < 2;

        if (!areAllTransactionsCreatedByOneActor) {
            return undefined;
        }
    } else {
        // 1. If actor data is unavailable, fall back to transaction direction.
        // We use amount sign here because there can be cases where actions are not available.
        // See: https://github.com/Expensify/App/pull/64802#issuecomment-3008944401
        const transactionsWithUnknownDirection = (transactions ?? []).filter((transaction, index) => transactionSigns.at(index) === undefined);
        const hasUnknownDirection = transactionSigns.some((sign) => sign === undefined);
        const unknownDirectionComesOnlyFromPendingScans = transactionsWithUnknownDirection.length > 0 && transactionsWithUnknownDirection.every(hasPendingScanStateAndUnknownDirection);
        const unknownDirectionComesOnlyFromReceiptBackedTransactions =
            hasAttendeeIdentifierForEachTransaction && transactionsWithUnknownDirection.length > 0 && transactionsWithUnknownDirection.every(hasReceiptBackedUnknownDirection);
        const hasOnlyUnknownDirections = transactionSigns.length > 0 && transactionSigns.every((sign) => sign === undefined);
        const hasOnlyUnknownNonPendingScanDirections =
            hasOnlyUnknownDirections &&
            transactionsWithUnknownDirection.every((transaction) => !hasPendingScanStateAndUnknownDirection(transaction)) &&
            hasAttendeeIdentifierForEachTransaction;

        if (hasUnknownDirection && !unknownDirectionComesOnlyFromPendingScans && !unknownDirectionComesOnlyFromReceiptBackedTransactions && !hasOnlyUnknownNonPendingScanDirections) {
            return undefined;
        }

        const knownTransactionSigns = transactionSigns.filter((sign): sign is number => sign !== undefined);

        if (knownTransactionSigns.length === 0 && !hasOnlyUnknownNonPendingScanDirections) {
            return undefined;
        }

        const areAmountsSignsTheSame = hasOnlyUnknownNonPendingScanDirections || new Set(knownTransactionSigns).size < 2;

        if (!areAmountsSignsTheSame) {
            return undefined;
        }
    }

    // 2. If there is only one attendee - we check that by counting unique emails converted to account IDs in the attendees list.
    // This is a fallback added because: https://github.com/Expensify/App/pull/64802#issuecomment-3007906310

    const attendeeIdentifiers = attendeeIdentifierGroups.flatMap((identifiers) => identifiers);
    const isThereOnlyOneAttendee = new Set(attendeeIdentifiers).size <= 1;

    if (!isThereOnlyOneAttendee) {
        return undefined;
    }

    // If the action is a 'Send Money' flow, it will only have one transaction, but the person who sent the money is the child manager account, not the child owner account.
    const isSendMoneyFlowBasedOnActions = activeIOUActions.length > 0 && activeIOUActions.every(isSentMoneyReportAction);
    // This is used only if there are no IOU actions in the Onyx
    // eslint-disable-next-line rulesdir/no-negated-variables
    const isSendMoneyFlowBasedOnTransactions =
        !!action && action.childMoneyRequestCount === 0 && transactions?.length === 1 && (chatReport ? isDM(chatReport) : policy?.type === CONST.POLICY.TYPE.PERSONAL);

    const isSendMoneyFlow = activeIOUActions.length > 0 ? isSendMoneyFlowBasedOnActions : isSendMoneyFlowBasedOnTransactions;

    const singleAvatarAccountID = isSendMoneyFlow
        ? normalizeAccountID(action?.childManagerAccountID ?? iouReport?.managerID)
        : normalizeAccountID(action?.childOwnerAccountID ?? iouReport?.ownerAccountID);
    return singleAvatarAccountID;
}

function useReportPreviewSenderID({iouReport, action, chatReport}: {action: OnyxEntry<ReportAction>; chatReport: OnyxEntry<Report>; iouReport: OnyxEntry<Report>}): number | undefined {
    const isOptimisticReportPreview = action?.isOptimisticAction && action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isIOUReport(iouReport);

    // Only subscribe to Onyx data if not an optimistic action
    const shouldFetchData = !isOptimisticReportPreview;

    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(shouldFetchData ? iouReport?.reportID : undefined)}`, {
        selector: getIOUActionsSelector,
    });
    const [hasFinishedInitialReportActionsLoad] = useOnyx(
        `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${getNonEmptyStringOnyxID(shouldFetchData ? action?.childReportID : undefined)}`,
        {
            selector: (state) => hasOnceLoadedReportActionsSelector(state) === true || isLoadingInitialReportActionsSelector(state) === false,
        },
    );

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(shouldFetchData ? action?.childReportID : undefined);
    const transactions = useMemo(() => {
        if (!shouldFetchData) {
            return undefined;
        }
        const activeMoneyRequestCount = iouReport?.transactionCount ?? action?.childMoneyRequestCount ?? 0;
        const allReportTransactions = Object.values(reportTransactions ?? {}).filter((transaction): transaction is Transaction => !!transaction);
        // Start with orphan-inclusive filtering so refreshed receipt-backed expenses are not dropped too early,
        // then fall back to the stricter path only when it does not undercount the active requests.
        const nonDeletedTransactionsIncludingOrphans = getAllNonDeletedTransactions(reportTransactions, iouActions ?? [], false, true);
        const filteredTransactions =
            nonDeletedTransactionsIncludingOrphans.length < allReportTransactions.length
                ? getAllNonDeletedTransactions(reportTransactions, iouActions ?? [])
                : nonDeletedTransactionsIncludingOrphans;

        if (filteredTransactions.length < allReportTransactions.length && filteredTransactions.length < activeMoneyRequestCount) {
            return nonDeletedTransactionsIncludingOrphans;
        }

        return filteredTransactions;
    }, [reportTransactions, iouActions, shouldFetchData, iouReport?.transactionCount, action?.childMoneyRequestCount]);

    const [splits] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(shouldFetchData ? chatReport?.reportID : undefined)}`, {
        selector: getSplitsSelector,
    });

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(shouldFetchData ? iouReport?.policyID : undefined)}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    return getReportPreviewSenderID({iouReport, action, chatReport, iouActions, transactions, splits, policy, currentUserAccountID, hasFinishedInitialReportActionsLoad});
}

export default useReportPreviewSenderID;
export {getReportPreviewSenderID};
