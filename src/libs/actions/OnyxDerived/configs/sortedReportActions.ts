import {getCombinedReportActions, getOneTransactionThreadReportID, getSortedReportActions, withDEWRoutedActionsArray} from '@libs/ReportActionsUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

const EMPTY_VALUE: SortedReportActionsDerivedValue = {sortedActions: {}, lastActions: {}, transactionThreadIDs: {}};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SORTED_REPORT_ACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT],
    compute: ([allReportActions, allReports]): SortedReportActionsDerivedValue => {
        if (!allReportActions) {
            return EMPTY_VALUE;
        }

        const sortedActions: SortedReportActionsDerivedValue['sortedActions'] = {};
        const lastActions: SortedReportActionsDerivedValue['lastActions'] = {};
        const transactionThreadIDs: SortedReportActionsDerivedValue['transactionThreadIDs'] = {};

        // Iterate over the report actions to build the sorted report actions objects
        for (const [key, actions] of Object.entries(allReportActions)) {
            if (!actions) {
                continue;
            }

            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            if (!reportID) {
                continue;
            }

            const reportActionsArray = Object.values(actions);
            let sortedReportActions = getSortedReportActions(withDEWRoutedActionsArray(reportActionsArray), true);
            sortedActions[reportID] = sortedReportActions;

            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

            // If the report is a one-transaction report, we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself.
            // Cache the result for O(1) lookup in renderItem.
            const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, actions);
            transactionThreadIDs[reportID] = transactionThreadReportID;

            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
                sortedReportActions = getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID);
            }

            const firstReportAction = sortedReportActions.at(0);
            if (firstReportAction) {
                lastActions[reportID] = firstReportAction;
            }
        }

        return {sortedActions, lastActions, transactionThreadIDs};
    },
});
