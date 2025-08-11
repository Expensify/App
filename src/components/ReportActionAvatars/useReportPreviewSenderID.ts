import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {isDM} from '@libs/ReportUtils';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

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

function useReportPreviewSenderID({iouReport, action, chatReport}: {action: OnyxEntry<ReportAction>; chatReport: OnyxEntry<Report>; iouReport: OnyxEntry<Report>}) {
    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`, {
        canBeMissing: true,
        selector: (actions) => Object.values(actions ?? {}).filter(isMoneyRequestAction),
    });

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(action?.childReportID);
    const transactions = useMemo(() => getAllNonDeletedTransactions(reportTransactions, iouActions ?? []), [reportTransactions, iouActions]);

    const [splits] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`, {
        canBeMissing: true,
        selector: (actions) =>
            Object.values(actions ?? {})
                .filter(isMoneyRequestAction)
                .filter((act) => getOriginalMessage(act)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT),
    });

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`, {
        canBeMissing: true,
    });

    if (action?.isOptimisticAction && action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        return getCurrentUserAccountID();
    }

    // 1. If all amounts have the same sign - either all amounts are positive or all amounts are negative.
    // We have to do it this way because there can be a case when actions are not available
    // See: https://github.com/Expensify/App/pull/64802#issuecomment-3008944401

    const areAmountsSignsTheSame = new Set(transactions?.map((tr) => Math.sign(tr.amount))).size < 2;

    // 2. If there is only one attendee - we check that by counting unique emails converted to account IDs in the attendees list.
    // This is a fallback added because: https://github.com/Expensify/App/pull/64802#issuecomment-3007906310

    const attendeesIDs = transactions
        // If the transaction is a split, then attendees are not present as a property so we need to use a helper function.
        ?.flatMap<number | undefined>((tr) =>
            tr.comment?.attendees?.map?.((att) => (tr.comment?.source === CONST.IOU.TYPE.SPLIT ? getSplitAuthor(tr, splits) : getPersonalDetailByEmail(att.email)?.accountID)),
        )
        .filter((accountID) => !!accountID);

    const isThereOnlyOneAttendee = new Set(attendeesIDs).size <= 1;

    // If the action is a 'Send Money' flow, it will only have one transaction, but the person who sent the money is the child manager account, not the child owner account.
    const isSendMoneyFlowBasedOnActions = !!iouActions && iouActions.every(isSentMoneyReportAction);
    // This is used only if there are no IOU actions in the Onyx
    // eslint-disable-next-line rulesdir/no-negated-variables
    const isSendMoneyFlowBasedOnTransactions =
        !!action && action.childMoneyRequestCount === 0 && transactions?.length === 1 && (chatReport ? isDM(chatReport) : policy?.type === CONST.POLICY.TYPE.PERSONAL);

    const isSendMoneyFlow = !!iouActions && iouActions?.length > 0 ? isSendMoneyFlowBasedOnActions : isSendMoneyFlowBasedOnTransactions;

    const singleAvatarAccountID = isSendMoneyFlow ? action?.childManagerAccountID : action?.childOwnerAccountID;

    return areAmountsSignsTheSame && isThereOnlyOneAttendee ? singleAvatarAccountID : undefined;
}

export default useReportPreviewSenderID;
