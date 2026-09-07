import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSentMoneyReportAction} from '@libs/ReportActionsUtils';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOneTransactionThreadReportID from './useOneTransactionThreadReportID';
import useParentReportAction from './useParentReportAction';

/**
 * Whether the report is the transaction thread of its parent report's only expense.
 *
 * This is the reactive counterpart of `ReportUtils.isOneTransactionThread`. That util resolves the parent report, its
 * report actions and the chat report through module globals, so it does not re-run when any of them change and cannot
 * be used to drive rendering. Both end up on the same `getOneTransactionThreadReportID` derivation - here through
 * `useOneTransactionThreadReportID`.
 *
 * That shared derivation does not exclude send money: `getOneTransactionThreadReportAction` returns the send money
 * action early. The exclusion - send money's thread is not interchangeable with its report - comes only from the
 * explicit `isSentMoneyReportAction` guard below, so do not drop that guard as redundant.
 */
function useIsOneTransactionThread(report: OnyxEntry<Report>): boolean {
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);
    const oneTransactionThreadReportID = useOneTransactionThreadReportID(parentReportID);
    const parentReportAction = useParentReportAction(report);

    return !!report?.reportID && oneTransactionThreadReportID === report.reportID && !isSentMoneyReportAction(parentReportAction);
}

export default useIsOneTransactionThread;
