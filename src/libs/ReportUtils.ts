import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

/**
 * Calculates the total amount of a report, excluding expenses that are on hold.
 */
function getReportTotalAmount(report: Report, reportActions: Record<string, any>): number {
    return Object.values(reportActions).reduce((total, action) => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return total;
        }
        
        // Exclude expenses that are on hold
        if (action.originalMessage?.holdStatus === CONST.IOU.HOLD_STATUS.ON_HOLD) {
            return total;
        }

        return total + (action.originalMessage?.amount ?? 0);
    }, 0);
}

export {getReportTotalAmount};
