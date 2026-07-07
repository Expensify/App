import {getIsOffline} from '@libs/NetworkState';
import {getCombinedReportActions, getOneTransactionThreadReportID, getSortedReportActions, withDEWRoutedActionsArray} from '@libs/ReportActionsUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection} from 'react-native-onyx';

const EMPTY_VALUE: SortedReportActionsDerivedValue = {sortedActions: {}, lastActions: {}, transactionThreadIDs: {}};

function computeForReport(
    reportID: string,
    actions: ReportActions,
    allReportActions: OnyxCollection<ReportActions>,
    allReports: OnyxCollection<Report>,
    isOffline: boolean,
): {sortedReportActions: ReportAction[]; transactionThreadReportID: string | undefined; lastAction: ReportAction | undefined} {
    const reportActionsArray = Object.values(actions);
    let sortedReportActions = getSortedReportActions(withDEWRoutedActionsArray(reportActionsArray), true);

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, actions, isOffline);

    if (transactionThreadReportID && allReportActions) {
        const transactionThreadReportActionsArray = Object.values(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {});
        const isSelfDM = report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM;
        sortedReportActions = getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, isSelfDM);
    }

    return {
        sortedReportActions,
        transactionThreadReportID,
        lastAction: sortedReportActions.at(0),
    };
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.NETWORK],
    compute: ([allReportActions, allReports], {sourceValues, currentValue, triggeredKeys}): SortedReportActionsDerivedValue => {
        if (!allReportActions) {
            return EMPTY_VALUE;
        }

        // Read the in-memory offline state directly (NETWORK is a dependency so recompute still fires when it changes).
        const isOffline = getIsOffline();

        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];

        // The incremental branch only knows how to react to report-action changes; REPORT/NETWORK changes are
        // handled by the full recompute below. Coalescing can batch REPORT_ACTIONS with REPORT/NETWORK in a
        // single flush, so only go incremental when report actions are the sole trigger — otherwise a batched
        // REPORT change (e.g. chatReportID -> transactionThreadReportID) would be silently dropped.
        const reportActionsIsOnlyTrigger = triggeredKeys?.size === 1;

        // Incremental update: only recompute reports whose actions changed
        if (reportActionsUpdates && currentValue && reportActionsIsOnlyTrigger) {
            const sortedActions = {...currentValue.sortedActions};
            const lastActions = {...currentValue.lastActions};
            const transactionThreadIDs = {...currentValue.transactionThreadIDs};

            for (const reportActionsKey of Object.keys(reportActionsUpdates)) {
                const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                if (!reportID) {
                    continue;
                }

                const actions = allReportActions[reportActionsKey];
                if (!actions) {
                    delete sortedActions[reportID];
                    delete lastActions[reportID];
                    delete transactionThreadIDs[reportID];
                    continue;
                }

                const result = computeForReport(reportID, actions, allReportActions, allReports, isOffline);
                sortedActions[reportID] = result.sortedReportActions;
                transactionThreadIDs[reportID] = result.transactionThreadReportID;
                if (result.lastAction) {
                    lastActions[reportID] = result.lastAction;
                } else {
                    delete lastActions[reportID];
                }
            }

            return {sortedActions, lastActions, transactionThreadIDs};
        }

        // Full recompute on first load or when reports change
        const sortedActions: SortedReportActionsDerivedValue['sortedActions'] = {};
        const lastActions: SortedReportActionsDerivedValue['lastActions'] = {};
        const transactionThreadIDs: SortedReportActionsDerivedValue['transactionThreadIDs'] = {};

        for (const [key, actions] of Object.entries(allReportActions)) {
            if (!actions) {
                continue;
            }

            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            if (!reportID) {
                continue;
            }

            const result = computeForReport(reportID, actions, allReportActions, allReports, isOffline);
            sortedActions[reportID] = result.sortedReportActions;
            transactionThreadIDs[reportID] = result.transactionThreadReportID;
            if (result.lastAction) {
                lastActions[reportID] = result.lastAction;
            } else {
                delete lastActions[reportID];
            }
        }

        return {sortedActions, lastActions, transactionThreadIDs};
    },
});

export {computeForReport};
