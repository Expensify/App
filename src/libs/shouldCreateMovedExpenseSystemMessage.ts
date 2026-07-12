import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import * as ReportUtils from './ReportUtils';

type MovedExpenseSystemMessageOptions = {
    /** True when the user is acting from / on a Draft report */
    isDraftAction?: boolean;
    /** True when the expense is being rejected */
    isRejectFlow?: boolean;
    /** True when the expense is moved because it was held while the rest of the report was approved */
    isHeldExpenseMovedOnApprove?: boolean;
};

/**
 * Draft expense reports are open, unsubmitted expense reports.
 * Kept local so this helper stays usable even if ReportUtils naming differs slightly across branches.
 */
function isDraftExpenseReport(report: OnyxEntry<Report>): boolean {
    if (!report) {
        return false;
    }

    if (typeof ReportUtils.isDraftReport === 'function') {
        return ReportUtils.isDraftReport(report);
    }

    const isExpense =
        typeof ReportUtils.isExpenseReport === 'function'
            ? ReportUtils.isExpenseReport(report)
            : report.type === CONST.REPORT.TYPE.EXPENSE;

    const isOpen =
        report.statusNum === CONST.REPORT.STATUS_NUM.OPEN ||
        report.state === CONST.REPORT.STATE_NUM.OPEN;

    // Unsubmitted / draft: open expense report that has not been submitted for approval
    const isUnsubmitted =
        !report.isSubmitted &&
        report.stateNum !== CONST.REPORT.STATE_NUM.SUBMITTED &&
        report.statusNum !== CONST.REPORT.STATUS_NUM.SUBMITTED;

    return Boolean(isExpense && isOpen && isUnsubmitted);
}

/**
 * Whether we should create a system message when an expense is moved between reports.
 *
 * Rules from https://github.com/Expensify/App/issues/70485:
 * - Remove system messages for moving expenses when the action is taken on a Draft report.
 * - Remove additional system messages when an expense is rejected or moved due to the expense
 *   being held while the rest are approved.
 * - (Already done elsewhere) Message should refer to the report it was moved *from*.
 */
function shouldCreateMovedExpenseSystemMessage(
    sourceReport: OnyxEntry<Report>,
    options: MovedExpenseSystemMessageOptions = {},
): boolean {
    if (!sourceReport) {
        return false;
    }

    if (options.isDraftAction || isDraftExpenseReport(sourceReport)) {
        return false;
    }

    if (options.isRejectFlow || options.isHeldExpenseMovedOnApprove) {
        return false;
    }

    return true;
}

export default shouldCreateMovedExpenseSystemMessage;
export {isDraftExpenseReport};
export type {MovedExpenseSystemMessageOptions};
