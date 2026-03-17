import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import {getCombinedReportActions, getOneTransactionThreadReportID, getSortedReportActions, withDEWRoutedActionsArray} from './ReportActionsUtils';

type ProcessedReportActions = {
    /** Pre-combined sorted actions (own report only, before transaction thread merge). Maps to allSortedReportActions cache. */
    sortedActions: ReportAction[];
    /** First element of post-combined sorted actions (after transaction thread merge). Maps to lastReportActions cache. */
    lastAction: ReportAction | undefined;
    transactionThreadReportID: string | undefined;
};

function computeReportActionsState(reportID: string, actions: NonNullable<OnyxCollection<ReportActions>>, reports: OnyxCollection<Report>): ProcessedReportActions {
    const collectionKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
    const reportActionsRecord = actions[collectionKey];
    const reportActionsArray = Object.values(reportActionsRecord ?? {});

    // This is the pre-combined sort — stored in allSortedReportActions cache
    const sortedActions = getSortedReportActions(withDEWRoutedActionsArray(reportActionsArray), true);

    const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActionsRecord);

    // Post-combined sort — only used to derive lastAction
    let combinedActions = sortedActions;
    if (transactionThreadReportID) {
        const transactionThreadReportActionsArray = Object.values(actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
        combinedActions = getCombinedReportActions(sortedActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID);
    }

    const lastAction = combinedActions.at(0);

    return {
        sortedActions,
        lastAction,
        transactionThreadReportID,
    };
}

export type {ProcessedReportActions};
export default computeReportActionsState;
