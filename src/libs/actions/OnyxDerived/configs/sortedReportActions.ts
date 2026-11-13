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

/**
 * Returns the reports whose sorted actions can change: their actions, the report or its chat report changed,
 * or the actions of their one transaction thread changed.
 */
function getReportIDsToRecompute(
    allReportActions: NonNullable<OnyxCollection<ReportActions>>,
    allReports: OnyxCollection<Report>,
    reportActionsUpdates: OnyxCollection<ReportActions> | undefined,
    reportUpdates: OnyxCollection<Report> | undefined,
    transactionThreadIDs: SortedReportActionsDerivedValue['transactionThreadIDs'],
): Set<string> {
    const changedActionsReportIDs = new Set(Object.keys(reportActionsUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')));
    const changedReportIDs = new Set(Object.keys(reportUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT, '')));
    const reportIDs = new Set([...changedActionsReportIDs, ...changedReportIDs]);

    if (changedReportIDs.size > 0) {
        for (const reportActionsKey of Object.keys(allReportActions)) {
            const reportID = reportActionsKey.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            const chatReportID = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.chatReportID;
            if (chatReportID && changedReportIDs.has(chatReportID)) {
                reportIDs.add(reportID);
            }
        }
    }

    if (changedActionsReportIDs.size > 0) {
        for (const [reportID, transactionThreadReportID] of Object.entries(transactionThreadIDs)) {
            if (transactionThreadReportID && changedActionsReportIDs.has(transactionThreadReportID)) {
                reportIDs.add(reportID);
            }
        }
    }

    return reportIDs;
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
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        // Going offline changes which deleted expenses count toward the one transaction thread, so it needs a full recompute.
        if ((reportActionsUpdates ?? reportUpdates) && currentValue && !triggeredKeys?.has(ONYXKEYS.NETWORK)) {
            const sortedActions = {...currentValue.sortedActions};
            const lastActions = {...currentValue.lastActions};
            const transactionThreadIDs = {...currentValue.transactionThreadIDs};

            for (const reportID of getReportIDsToRecompute(allReportActions, allReports, reportActionsUpdates, reportUpdates, currentValue.transactionThreadIDs)) {
                if (!reportID) {
                    continue;
                }

                const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
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

        // Full recompute on first load or when the network changes
        const sortedActions: SortedReportActionsDerivedValue['sortedActions'] = {};
        const lastActions: SortedReportActionsDerivedValue['lastActions'] = {};
        const transactionThreadIDs: SortedReportActionsDerivedValue['transactionThreadIDs'] = {};

        for (const key of Object.keys(allReportActions)) {
            const actions = allReportActions[key];
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
