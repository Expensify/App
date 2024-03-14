import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAction} from '@src/types/onyx';
import originalModifiedExpenseMessage from './ModifiedExpenseMessage';

/**
 * Get the report action message when expense has been modified.
 *
 * ModifiedExpense::getNewDotComment in Web-Expensify should match this.
 * If we change this function be sure to update the backend as well.
 */
function getForReportAction(reportID: string | undefined, reportAction: OnyxEntry<ReportAction> | ReportAction | Record<string, never>): string {
    return originalModifiedExpenseMessage.getForReportAction(reportID, reportAction);
}

export default getForReportAction;
