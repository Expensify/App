import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSentMoneyReportAction} from '@libs/ReportActionsUtils';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOneTransactionThreadReportID from './useOneTransactionThreadReportID';
import useParentReportAction from './useParentReportAction';

/**
 * Whether the report is the transaction thread of its parent report's only expense. Reactive counterpart of
 * `ReportUtils.isOneTransactionThread`, which reads module globals and so cannot drive rendering.
 */
function useIsOneTransactionThread(report: OnyxEntry<Report>): boolean {
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);
    const oneTransactionThreadReportID = useOneTransactionThreadReportID(parentReportID);
    const parentReportAction = useParentReportAction(report);

    // A send money thread is not interchangeable with its report, and the shared derivation doesn't exclude it.
    return !!report?.reportID && oneTransactionThreadReportID === report.reportID && !isSentMoneyReportAction(parentReportAction);
}

export default useIsOneTransactionThread;
