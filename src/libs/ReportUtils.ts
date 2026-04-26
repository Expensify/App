import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as CurrencyUtils from './CurrencyUtils';
import * as MoneyRequestUtils from './MoneyRequestUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

type ReportWithOptionalPolicy = Report & {policy?: OnyxEntry<Policy>};

function getReasonAndReportActionThatRequiresAttention(optionOrReport: ReportWithOptionalPolicy): {reason: ValueOf<typeof CONST.REQUIRES_ATTENTION_REASONS>; reportAction: OnyxEntry<ReportAction>} | undefined {
    const {hasOutstandingChildRequest} = optionOrReport;
    const iouReportActionToApproveOrPay = MoneyRequestUtils.getIOUReportActionThatRequiresAttention(optionOrReport);
    const policy = optionOrReport.policy;
    const hasOnlyPendingTransactions = TransactionUtils.hasOnlyPendingTransactions(optionOrReport.reportID);
    const isSettled = MoneyRequestUtils.isSettled(optionOrReport.reportID);
    const isArchivedRoom = optionOrReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && optionOrReport.statusNum === CONST.REPORT.STATUS.CLOSED;
    const isUserInitiatedSplit = optionOrReport.hasOutstandingChildRequest && optionOrReport.type === CONST.REPORT.TYPE.IOU;

    // For non-user-initiated splits (e.g. expense reports, trip rooms), we should only show GBR if there is an actionable IOU report action.
    // This prevents stale hasOutstandingChildRequest from triggering GBR when there are no actual pending actions.
    const isValidOutstandingChildRequest = hasOutstandingChildRequest && iouReportActionToApproveOrPay?.reportActionID;

    if (
        isValidOutstandingChildRequest &&
        (policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO || !hasOnlyPendingTransactions)
    ) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION,
            reportAction: iouReportActionToApproveOrPay,
        };
    }

    // ... rest of the function remains unchanged
    // (existing conditions for other GBR reasons like HAS_OUTSTANDING_RECEIPTS, etc.)
}