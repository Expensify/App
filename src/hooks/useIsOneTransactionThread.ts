import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSentMoneyReportAction} from '@libs/ReportActionsUtils';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOneTransactionThreadReportID from './useOneTransactionThreadReportID';
import useParentReportAction from './useParentReportAction';

/**
 * Whether the report is the transaction thread of its parent report's only expense.
 *
 * Reactive counterpart of `ReportUtils.isOneTransactionThread`, which reads module globals and so cannot drive
 * rendering. Both share the same `getOneTransactionThreadReportID` derivation.
 *
 * That derivation does not exclude send money, so the `isSentMoneyReportAction` guard below is not redundant: a send
 * money thread is not interchangeable with its report.
 */
function useIsOneTransactionThread(report: OnyxEntry<Report>): boolean {
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);
    const oneTransactionThreadReportID = useOneTransactionThreadReportID(parentReportID);
    const parentReportAction = useParentReportAction(report);

    return !!report?.reportID && oneTransactionThreadReportID === report.reportID && !isSentMoneyReportAction(parentReportAction);
}

export default useIsOneTransactionThread;
