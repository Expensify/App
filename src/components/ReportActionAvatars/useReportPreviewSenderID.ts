import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedParentAction, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {isDM, isIOUReport} from '@libs/ReportUtils';
import {isScanRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

    if (isScanRequest(transaction)) {
        const modifiedAmount = Number(transaction.modifiedAmount);

        if (Number.isFinite(modifiedAmount) && modifiedAmount !== 0) {
            return Math.sign(modifiedAmount);
        }
    }

    return undefined;
}

function isExplicitlyDeletedIOUAction(iouAction: ReportAction): boolean {
    const originalMessage = getOriginalMessage(iouAction) as OriginalMessageIOU | undefined;

    if (originalMessage?.deleted) {
        return true;
    }

    if (isDeletedParentAction(iouAction)) {
        return true;
    }

    const message = iouAction.message;

    if (Array.isArray(message)) {
        return message.some((fragment) => !!fragment?.deleted);
    }

    return !!message?.deleted;
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
};

function getReportPreviewSenderID({iouReport, action, chatReport, iouActions, transactions, splits, policy, currentUserAccountID}: GetReportPreviewSenderIDParams): number | undefined {
    const isOptimisticReportPreview = action?.isOptimisticAction && action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isIOUReport(iouReport);
    if (isOptimisticReportPreview) {
        return currentUserAccountID;
    }

    const loadedTransactionCount = transactions?.length ?? 0;
    const childMoneyRequestCount = action?.childMoneyRequestCount ?? 0;
    const activeMoneyRequestCount = iouReport?.transactionCount ?? childMoneyRequestCount;
    const activeIOUActions =
        iouActions?.filter((iouAction) => {
            return !isExplicitlyDeletedIOUAction(iouAction);
        }) ?? [];
    const uniqueIOUActionActorMap = new Map<string, number>();

    for (const iouAction of activeIOUActions) {
        const iouTransactionID = (getOriginalMessage(iouAction) as OriginalMessageIOU | undefined)?.IOUTransactionID;

        if (!iouTransactionID || iouAction.actorAccountID === undefined) {
            continue;
        }

        uniqueIOUActionActorMap.set(iouTransactionID, iouAction.actorAccountID);
    }

    const hasCompleteActionCoverage = activeMoneyRequestCount > 0 && uniqueIOUActionActorMap.size >= activeMoneyRequestCount;
    const areAllActiveChildRequestsCreatedByOneActor = new Set(uniqueIOUActionActorMap.values()).size < 2;
    const canInferFromIOUActionsDuringPartialHydration = loadedTransactionCount > 0 && hasCompleteActionCoverage && activeIOUActions.length > 0 && areAllActiveChildRequestsCreatedByOneActor;

    // After refresh, the preview action can hydrate before all active child transactions.
    // Avoid collapsing to one avatar unless the available IOU actions already prove the remaining
    // active requests all belong to the same sender.
    if (activeMoneyRequestCount > loadedTransactionCount && !canInferFromIOUActionsDuringPartialHydration) {
        return undefined;
    }

    const transactionActorAccountIDs = transactions?.map((transaction) => getIOUActionForTransactionID(activeIOUActions, transaction.transactionID)?.actorAccountID);
    const hasActorAccountIDForEachTransaction =
        activeIOUActions.length > 0 && !!transactionActorAccountIDs && transactionActorAccountIDs.length > 0 && transactionActorAccountIDs.every((accountID) => accountID !== undefined);

    // 1. Use actorAccountID when it is available for every transaction. Otherwise, fall back to known transaction direction only.
    if (hasActorAccountIDForEachTransaction) {
        const areAllTransactionsCreatedByOneActor = new Set(transactionActorAccountIDs).size < 2;

        if (!areAllTransactionsCreatedByOneActor) {
            return undefined;
        }
    } else {
        const transactionSigns = transactions?.map((transaction) => getTransactionDirectionSign(transaction)) ?? [];
        const hasUnknownDirection = transactionSigns.some((sign) => sign === undefined);

        if (hasUnknownDirection) {
            return undefined;
        }

        const areAmountsSignsTheSame = new Set(transactionSigns).size < 2;

        if (!areAmountsSignsTheSame) {
            return undefined;
        }
    }

    // 2. If there is only one attendee - we check that by counting unique emails converted to account IDs in the attendees list.
    // This is a fallback added because: https://github.com/Expensify/App/pull/64802#issuecomment-3007906310

    const attendeesIDs = transactions
        // If the transaction is a split, then attendees are not present as a property so we need to use a helper function.
        ?.flatMap<number | undefined>((tr) =>
            tr.comment?.attendees?.map?.((att) => (tr.comment?.source === CONST.IOU.TYPE.SPLIT ? getSplitAuthor(tr, splits) : getPersonalDetailByEmail(att.email)?.accountID)),
        )
        .filter((accountID) => !!accountID);

    const isThereOnlyOneAttendee = new Set(attendeesIDs).size <= 1;

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

    const singleAvatarAccountID = isSendMoneyFlow ? action?.childManagerAccountID : action?.childOwnerAccountID;

    return singleAvatarAccountID;
}

function useReportPreviewSenderID({iouReport, action, chatReport}: {action: OnyxEntry<ReportAction>; chatReport: OnyxEntry<Report>; iouReport: OnyxEntry<Report>}): number | undefined {
    const isOptimisticReportPreview = action?.isOptimisticAction && action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isIOUReport(iouReport);

    // Only subscribe to Onyx data if not an optimistic action
    const shouldFetchData = !isOptimisticReportPreview;

    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(shouldFetchData ? iouReport?.reportID : undefined)}`, {
        selector: getIOUActionsSelector,
    });

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(shouldFetchData ? action?.childReportID : undefined);
    const transactions = useMemo(() => {
        if (!shouldFetchData) {
            return undefined;
        }
        return getAllNonDeletedTransactions(reportTransactions, iouActions ?? []);
    }, [reportTransactions, iouActions, shouldFetchData]);

    const [splits] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(shouldFetchData ? chatReport?.reportID : undefined)}`, {
        selector: getSplitsSelector,
    });

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(shouldFetchData ? iouReport?.policyID : undefined)}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    return getReportPreviewSenderID({iouReport, action, chatReport, iouActions, transactions, splits, policy, currentUserAccountID});
}

export default useReportPreviewSenderID;
export {getReportPreviewSenderID};
export type {GetReportPreviewSenderIDParams};
