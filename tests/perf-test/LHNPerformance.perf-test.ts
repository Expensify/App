import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import {getSortedReportActions, getSortedReportActionsForDisplay, shouldReportActionBeVisibleAsLastAction, getOriginalMessage, isInviteOrRemovedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {PersonalDetails, Report, ReportActions, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 150;
const ACTIONS_PER_REPORT = 50;

const createMockReportActions = (reportID: string, count: number): ReportActions => {
    const actions: ReportActions = {};
    for (let i = 0; i < count; i++) {
        const action = createRandomReportAction(i);
        actions[`${reportID}_${i}`] = action;
    }
    return actions;
};

const createReportsWithActions = (count: number) => {
    const reports: OnyxCollection<Report> = {};
    const reportActions: OnyxCollection<ReportActions> = {};
    const reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
    const policies: OnyxCollection<Policy> = {};
    const personalDetails: OnyxCollection<PersonalDetails> = {};
    const reportMetadata: OnyxCollection<ReportMetadata> = {};

    const basePolicy = createRandomPolicy(1);
    policies[`${ONYXKEYS.COLLECTION.POLICY}${basePolicy.id}`] = basePolicy;

    for (let i = 1; i <= count; i++) {
        const reportID = String(i);
        const report = createRandomReport(i, undefined);

        const isArchived = i % 10 === 0;
        const reportTypeMod = i % 4;
        let reportType = CONST.REPORT.TYPE.CHAT;
        if (reportTypeMod === 0) {
            reportType = CONST.REPORT.TYPE.IOU;
        } else if (reportTypeMod === 1) {
            reportType = CONST.REPORT.TYPE.EXPENSE;
        }

        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            ...report,
            type: reportType,
        };
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createMockReportActions(reportID, ACTIONS_PER_REPORT);
        reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {
            private_isArchived: isArchived ? 'true' : 'false',
        };

        const lastActorAccountID = report.lastActorAccountID ?? i;
        personalDetails[String(lastActorAccountID)] = createPersonalDetails(lastActorAccountID);

        if (i % 5 === 0) {
            reportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`] = {
                lastVisitTime: new Date().toISOString(),
            };
        }
    }

    return {
        reports,
        reportActions,
        reportNameValuePairs,
        policies,
        personalDetails,
        reportMetadata,
    };
};

describe('LHN Performance Baseline', () => {
    const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        } as Parameters<typeof Onyx.multiSet>[0]);
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[LHN Performance] getSortedReportActionsForDisplay called for all reports (simulating renderItem)', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    const canUserPerformWrite = true;
                    getSortedReportActionsForDisplay(actions, canUserPerformWrite);
                }
            }
        });
    });

    test('[LHN Performance] getSortedReportActions called for all reports (redundant call in renderItem line 248)', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    const actionsArray = Object.values(actions);
                    getSortedReportActions(actionsArray);
                }
            }
        });
    });

    test('[LHN Performance] shouldReportActionBeVisibleAsLastAction called for all actions (during filtering)', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    const actionsArray = Object.values(actions);
                    const sortedActions = getSortedReportActions(actionsArray, true);
                    const canUserPerformWrite = true;

                    for (const action of sortedActions) {
                        shouldReportActionBeVisibleAsLastAction(action, canUserPerformWrite);
                    }
                }
            }
        });
    });

    test('[LHN Performance] getLastMessageTextForReport called for all reports (simulating renderItem line 230)', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const report = reports[reportKey];
                const nvp = reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
                const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                const isReportArchived = !!nvp?.private_isArchived;

                if (report && actions) {
                    const lastActorAccountID = report.lastActorAccountID;
                    let lastActorDetails: Partial<PersonalDetails> | null = null;
                    if (lastActorAccountID && personalDetails[lastActorAccountID]) {
                        lastActorDetails = personalDetails[lastActorAccountID];
                    }

                    const sortedActions = getSortedReportActions(Object.values(actions), true);
                    const lastReportAction = sortedActions.at(0);

                    const movedFromReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM) : undefined;
                    const movedToReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO) : undefined;
                    const movedFromReport = movedFromReportID ? reports[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`] : undefined;
                    const movedToReport = movedToReportID ? reports[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`] : undefined;

                    const itemPolicy = policies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                    const itemReportMetadata = reportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

                    getLastMessageTextForReport({
                        translate: () => '',
                        report,
                        lastActorDetails,
                        movedFromReport,
                        movedToReport,
                        policy: itemPolicy,
                        isReportArchived,
                        policyForMovingExpensesID: undefined,
                        reportMetadata: itemReportMetadata,
                        currentUserAccountID: 0,
                    });
                }
            }
        });
    });

    test('[LHN Performance] Complete LHN renderItem simulation for all reports', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const item = reports[reportKey];
                const itemReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                const itemReportNameValuePairs = reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
                const isReportArchived = !!itemReportNameValuePairs?.private_isArchived;

                if (itemReportActions && item) {
                    const canUserPerformWrite = canUserPerformWriteAction(item, isReportArchived);
                    const sortedReportActions = getSortedReportActionsForDisplay(itemReportActions, canUserPerformWrite);
                    const lastReportAction = sortedReportActions.at(0);

                    let lastActorDetails: Partial<PersonalDetails> | null = null;
                    if (item.lastActorAccountID && personalDetails[item.lastActorAccountID]) {
                        lastActorDetails = personalDetails[item.lastActorAccountID] ?? null;
                    } else if (lastReportAction) {
                        const lastActorDisplayName = lastReportAction?.person?.[0]?.text;
                        lastActorDetails = lastActorDisplayName
                            ? {
                                  displayName: lastActorDisplayName,
                                  accountID: item.lastActorAccountID,
                              }
                            : null;
                    }

                    const movedFromReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM) : undefined;
                    const movedToReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO) : undefined;
                    const movedFromReport = movedFromReportID ? reports[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`] : undefined;
                    const movedToReport = movedToReportID ? reports[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`] : undefined;

                    const itemPolicy = policies[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                    const itemReportMetadata = reportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

                    const lastMessageTextFromReport = getLastMessageTextForReport({
                        translate: () => '',
                        report: item,
                        lastActorDetails,
                        movedFromReport,
                        movedToReport,
                        policy: itemPolicy,
                        isReportArchived,
                        policyForMovingExpensesID: undefined,
                        reportMetadata: itemReportMetadata,
                        currentUserAccountID: 0,
                    });

                    const canUserPerformWriteActionForLastAction = canUserPerformWriteAction(item, isReportArchived);
                    const actionsArray = getSortedReportActions(Object.values(itemReportActions));

                    const reportActionsForDisplay = actionsArray.filter(
                        (reportAction) => shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWriteActionForLastAction) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
                    );
                    const lastAction = reportActionsForDisplay.at(-1);

                    let lastActionReport: OnyxEntry<Report> | undefined;
                    if (lastAction && isInviteOrRemovedAction(lastAction)) {
                        const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
                        lastActionReport = lastActionOriginalMessage?.reportID
                            ? reports[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage.reportID}`]
                            : undefined;
                    }

                    expect([lastMessageTextFromReport, lastAction, lastActionReport]).toBeDefined();
                }
            }
        });
    });

    test('[LHN Performance] Scaling test - 50 reports', async () => {
        const smallDataSet = createReportsWithActions(50);
        await Onyx.multiSet({
            ...smallDataSet.reports,
            ...smallDataSet.reportActions,
            ...smallDataSet.reportNameValuePairs,
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(smallDataSet.reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = smallDataSet.reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[LHN Performance] Scaling test - 300 reports', async () => {
        const largeDataSet = createReportsWithActions(300);
        await Onyx.multiSet({
            ...largeDataSet.reports,
            ...largeDataSet.reportActions,
            ...largeDataSet.reportNameValuePairs,
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(largeDataSet.reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = largeDataSet.reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[LHN Performance] Scaling test - 500 reports', async () => {
        const dataSet = createReportsWithActions(500);
        await Onyx.multiSet({
            ...dataSet.reports,
            ...dataSet.reportActions,
            ...dataSet.reportNameValuePairs,
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(dataSet.reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = dataSet.reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[LHN Performance] Scaling test - 1000 reports', async () => {
        const dataSet = createReportsWithActions(1000);
        await Onyx.multiSet({
            ...dataSet.reports,
            ...dataSet.reportActions,
            ...dataSet.reportNameValuePairs,
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(dataSet.reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = dataSet.reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test(
        '[LHN Performance] Scaling test - 2000 reports',
        async () => {
            const dataSet = createReportsWithActions(2000);
            await Onyx.multiSet({
                ...dataSet.reports,
                ...dataSet.reportActions,
                ...dataSet.reportNameValuePairs,
            } as Parameters<typeof Onyx.multiSet>[0]);
            await waitForBatchedUpdates();

            await measureFunction(() => {
                for (const reportKey of Object.keys(dataSet.reports)) {
                    const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                    const actions = dataSet.reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                    if (actions) {
                        getSortedReportActionsForDisplay(actions, true);
                    }
                }
            });
        },
        600000,
    );

    test('[LHN Performance] Cache usage verification - allSortedReportActions cache', async () => {
        await waitForBatchedUpdates();
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        await measureFunction(() => {
            for (const reportKey of Object.keys(reports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });
});
