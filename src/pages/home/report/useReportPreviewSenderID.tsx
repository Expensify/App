import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {selectAllTransactionsForReport} from '@libs/MoneyRequestReportUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
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

/**
 * This hook is used to determine the ID of the sender for the report preview action.
 * There are few fallbacks to determine the sender ID.
 *
 * It should not be used outside of this component.
 * The only reason it is exported to a hook is to make it easier to remove it in the future.
 *
 * For a reason why it is here, see https://github.com/Expensify/App/pull/64802 discussion
 */
function useReportPreviewSenderID({action, iouReport, report}: {action: OnyxEntry<ReportAction>; iouReport: OnyxEntry<Report>; report: OnyxEntry<Report>}) {
    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`, {
        canBeMissing: true,
        selector: (actions) => Object.values(actions ?? {}).filter(isMoneyRequestAction),
    });

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
        selector: (allTransactions) => selectAllTransactionsForReport(allTransactions, action?.childReportID, iouActions ?? []),
    });

    const [splits] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {
        canBeMissing: true,
        selector: (actions) =>
            Object.values(actions ?? {})
                .filter(isMoneyRequestAction)
                .filter((act) => getOriginalMessage(act)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT),
    });

    if (action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        return;
    }

    /* We need to perform the following checks to determine if the report preview is a single avatar: */

    // 1. If all amounts have the same sign - either all amounts are positive or all amounts are negative.
    // We have to do this because there can be a case when actions are not available
    // See: https://github.com/Expensify/App/pull/64802#issuecomment-3008944401

    const areAmountsSignsTheSame = new Set(transactions?.map((tr) => Math.sign(tr.amount))).size < 2;

    // 2. If there is only one attendee - we check that by counting unique emails converted to account IDs in the attendees list.
    // This has to be done as there are cases when transaction amounts signs are the same until report is opened.
    // See: https://github.com/Expensify/App/pull/64802#issuecomment-3007906310

    const attendeesIDs = transactions
        // If the transaction is a split, then attendees are not present so we need to use a helper function.
        ?.flatMap<number | undefined>((tr) =>
            tr.comment?.attendees?.map((att) => (tr.comment?.source === CONST.IOU.TYPE.SPLIT ? getSplitAuthor(tr, splits) : getPersonalDetailByEmail(att.email)?.accountID)),
        )
        // We filter out empty ID's
        .filter((accountID) => !!accountID);

    const isThereOnlyOneAttendee = new Set(attendeesIDs).size <= 1;

    // If the action is a 'Send Money' flow, it will only have one transaction, but the person who sent the money is the child manager account, not the child owner account.
    const isSendMoneyFlow = action?.childMoneyRequestCount === 0 && transactions?.length === 1;
    const singleAvatarAccountID = isSendMoneyFlow ? action.childManagerAccountID : action?.childOwnerAccountID;

    return areAmountsSignsTheSame && isThereOnlyOneAttendee ? singleAvatarAccountID : undefined;
}

export default useReportPreviewSenderID;
