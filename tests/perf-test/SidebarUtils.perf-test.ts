import {rand} from '@ngneat/falso';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {
    getOriginalMessage,
    getSortedReportActions,
    getSortedReportActionsForDisplay,
    isInviteOrRemovedAction,
    shouldReportActionBeVisibleAsLastAction,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ReportActions, ReportMetadata, ReportNameValuePairs, TransactionViolation} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction, {getRandomDate} from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 15000;
const REPORT_THRESHOLD = 5;
const PERSONAL_DETAILS_LIST_COUNT = 1000;

const LHN_REPORTS_COUNT = 150;
const LHN_ACTIONS_PER_REPORT = 50;

const allReports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        ...createRandomReport(index, undefined),
        type: rand(Object.values(CONST.REPORT.TYPE)),
        lastVisibleActionCreated: getRandomDate(),
        // add status and state to every 5th report to mock non-archived reports
        statusNum: index % REPORT_THRESHOLD ? 0 : CONST.REPORT.STATUS_NUM.CLOSED,
        stateNum: index % REPORT_THRESHOLD ? 0 : CONST.REPORT.STATE_NUM.APPROVED,
        isUnreadWithMention: false,
    }),
    REPORTS_COUNT,
);

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    PERSONAL_DETAILS_LIST_COUNT,
);

const policies = createCollection<Policy>(
    (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
    (index) => createRandomPolicy(index),
);

const mockedBetas = Object.values(CONST.BETAS);

const currentReportId = '1';
const transactionViolations = {} as OnyxCollection<TransactionViolation[]>;

const createLHNReportActions = (reportID: string, count: number): ReportActions => {
    const actions: ReportActions = {};
    for (let i = 0; i < count; i++) {
        actions[`${reportID}_${i}`] = createRandomReportAction(i);
    }
    return actions;
};

const createLHNReportsWithActions = (count: number) => {
    const reports: OnyxCollection<Report> = {};
    const reportActions: OnyxCollection<ReportActions> = {};
    const reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
    const policies: OnyxCollection<Policy> = {};
    const personalDetailsWithActions: OnyxCollection<PersonalDetails> = {};
    const reportMetadata: OnyxCollection<ReportMetadata> = {};

    const basePolicy = createRandomPolicy(1);
    policies[`${ONYXKEYS.COLLECTION.POLICY}${basePolicy.id}`] = basePolicy;

    for (let i = 1; i <= count; i++) {
        const reportID = String(i);
        const report = createRandomReport(i, undefined);

        const isArchived = i % 10 === 0;
        const reportTypeMod = i % 4;
        let reportType: Report['type'] = CONST.REPORT.TYPE.CHAT;
        if (reportTypeMod === 0) {
            reportType = CONST.REPORT.TYPE.IOU;
        } else if (reportTypeMod === 1) {
            reportType = CONST.REPORT.TYPE.EXPENSE;
        }

        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            ...report,
            type: reportType,
        };
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createLHNReportActions(reportID, LHN_ACTIONS_PER_REPORT);
        reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {
            private_isArchived: isArchived ? 'true' : 'false',
        };

        const lastActorAccountID = report.lastActorAccountID ?? i;
        personalDetailsWithActions[String(lastActorAccountID)] = createPersonalDetails(lastActorAccountID);

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
        personalDetailsWithActions,
        reportMetadata,
    };
};

const {
    reports: lhnReports,
    reportActions: lhnReportActions,
    reportNameValuePairs: lhnReportNameValuePairs,
    policies: lhnPolicies,
    personalDetailsWithActions: lhnPersonalDetails,
    reportMetadata: lhnReportMetadata,
} = createLHNReportsWithActions(LHN_REPORTS_COUNT);

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                ...personalDetails,
                ...lhnPersonalDetails,
            },
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: 'en',
            ...lhnReports,
            ...lhnReportActions,
            ...lhnReportNameValuePairs,
            ...lhnPolicies,
            ...lhnReportMetadata,
        } as Parameters<typeof Onyx.multiSet>[0]);
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[SidebarUtils] getOptionData', async () => {
        const report = createRandomReport(1, undefined);
        const policy = createRandomPolicy(1);
        const parentReportAction = createRandomReportAction(1);
        const reportNameValuePairs = {};

        await waitForBatchedUpdates();

        await measureFunction(() =>
            SidebarUtils.getOptionData({
                report,
                reportAttributes: undefined,
                reportNameValuePairs,
                personalDetails,
                policy,
                parentReportAction,
                oneTransactionThreadReport: undefined,
                card: undefined,
                lastAction: undefined,
                translate: translateLocal,
                localeCompare,
                lastActionReport: undefined,
                isReportArchived: undefined,
                currentUserAccountID: 1,
            }),
        );
    });

    test('[SidebarUtils] getReportsToDisplayInLHN on 15k reports for default priorityMode', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => SidebarUtils.getReportsToDisplayInLHN(currentReportId, allReports, mockedBetas, policies, CONST.PRIORITY_MODE.DEFAULT, {}, transactionViolations));
    });

    test('[SidebarUtils] getReportsToDisplayInLHN on 15k reports for GSD priorityMode', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => SidebarUtils.getReportsToDisplayInLHN(currentReportId, allReports, mockedBetas, policies, CONST.PRIORITY_MODE.GSD, {}, transactionViolations));
    });

    test('[SidebarUtils LHN] getSortedReportActionsForDisplay for all reports (renderItem-style)', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    const canUserPerformWrite = true;
                    getSortedReportActionsForDisplay(actions, canUserPerformWrite);
                }
            }
        });
    });

    test('[SidebarUtils LHN] getSortedReportActions across all reports', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    const actionsArray = Object.values(actions);
                    getSortedReportActions(actionsArray);
                }
            }
        });
    });

    test('[SidebarUtils LHN] shouldReportActionBeVisibleAsLastAction across all actions', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

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

    test('[SidebarUtils LHN] getLastMessageTextForReport across all reports', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const report = lhnReports[reportKey];
                const nvp = lhnReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                const isReportArchived = !!nvp?.private_isArchived;

                if (report && actions) {
                    const lastActorAccountID = report.lastActorAccountID;
                    let lastActorDetails: Partial<PersonalDetails> | null = null;
                    if (lastActorAccountID && lhnPersonalDetails[lastActorAccountID]) {
                        lastActorDetails = lhnPersonalDetails[lastActorAccountID];
                    }

                    const sortedActions = getSortedReportActions(Object.values(actions), true);
                    const lastReportAction = sortedActions.at(0);

                    const movedFromReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM) : undefined;
                    const movedToReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO) : undefined;
                    const movedFromReport = movedFromReportID ? lhnReports[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`] : undefined;
                    const movedToReport = movedToReportID ? lhnReports[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`] : undefined;

                    const itemPolicy = lhnPolicies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                    const itemReportMetadata = lhnReportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

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

    test('[SidebarUtils LHN] composite renderItem-style simulation for all reports', async () => {
        await waitForBatchedUpdates();

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const item = lhnReports[reportKey];
                const itemReportActions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                const itemReportNameValuePairs = lhnReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
                const isReportArchived = !!itemReportNameValuePairs?.private_isArchived;

                if (itemReportActions && item) {
                    const canUserPerformWrite = canUserPerformWriteAction(item, isReportArchived);
                    const sortedReportActions = getSortedReportActionsForDisplay(itemReportActions, canUserPerformWrite);
                    const lastReportAction = sortedReportActions.at(0);

                    let lastActorDetails: Partial<PersonalDetails> | null = null;
                    if (item.lastActorAccountID && lhnPersonalDetails[item.lastActorAccountID]) {
                        lastActorDetails = lhnPersonalDetails[item.lastActorAccountID] ?? null;
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
                    const movedFromReport = movedFromReportID ? lhnReports[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`] : undefined;
                    const movedToReport = movedToReportID ? lhnReports[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`] : undefined;

                    const itemPolicy = lhnPolicies[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                    const itemReportMetadata = lhnReportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

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
                        (reportAction) =>
                            shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWriteActionForLastAction) &&
                            reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
                    );
                    const lastAction = reportActionsForDisplay.at(-1);

                    let lastActionReport: OnyxEntry<Report> | undefined;
                    if (lastAction && isInviteOrRemovedAction(lastAction)) {
                        const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
                        lastActionReport = lastActionOriginalMessage?.reportID
                            ? lhnReports[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage.reportID}`]
                            : undefined;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    [lastMessageTextFromReport, lastAction, lastActionReport];
                }
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 50 reports', async () => {
        const smallDataSet = createLHNReportsWithActions(50);
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

    test('[SidebarUtils LHN] scaling – 300 reports', async () => {
        const largeDataSet = createLHNReportsWithActions(300);
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

    test('[SidebarUtils LHN] scaling – 500 reports', async () => {
        const dataSet = createLHNReportsWithActions(500);
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

    test('[SidebarUtils LHN] scaling – 1000 reports', async () => {
        const dataSet = createLHNReportsWithActions(1000);
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

    test('[SidebarUtils LHN] scaling – 2000 reports', async () => {
        const dataSet = createLHNReportsWithActions(2000);
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
    }, 600000);

    test('[SidebarUtils LHN] cache usage verification – allSortedReportActions cache', async () => {
        await waitForBatchedUpdates();
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        await measureFunction(() => {
            for (const reportKey of Object.keys(lhnReports)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });
});
