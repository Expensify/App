import {rand} from '@ngneat/falso';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {getSortedReportActions, getSortedReportActionsForDisplay, shouldReportActionBeVisibleAsLastAction} from '@libs/ReportActionsUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, TransactionViolation} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction, {getRandomDate} from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import {createSidebarReportsWithActions} from '../utils/collections/sidebarReports';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 15000;
const REPORT_THRESHOLD = 5;
const PERSONAL_DETAILS_LIST_COUNT = 1000;

const LHN_REPORTS_COUNT = 150;

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

const {
    reports: initialLhnReports,
    reportActions: initialLhnReportActions,
    reportNameValuePairs: initialLhnReportNameValuePairs,
    policies: initialLhnPolicies,
    personalDetails: initialLhnPersonalDetails,
    reportMetadata: initialLhnReportMetadata,
} = createSidebarReportsWithActions(LHN_REPORTS_COUNT);

const lhnReports = initialLhnReports ?? {};
const lhnReportActions = initialLhnReportActions ?? {};
const lhnReportNameValuePairs = initialLhnReportNameValuePairs ?? {};
const lhnPolicies = initialLhnPolicies ?? {};
const lhnPersonalDetails = initialLhnPersonalDetails ?? {};
const lhnReportMetadata = initialLhnReportMetadata ?? {};

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
            const reportsMap = lhnReports ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
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
            const reportsMap = lhnReports ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
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
            const reportsMap = lhnReports ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
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

        const reportsMap = lhnReports ?? {};
        const nameValuePairsMap = lhnReportNameValuePairs ?? {};
        const actionsMap = lhnReportActions ?? {};
        const personalDetailsMap = lhnPersonalDetails ?? {};
        const policiesMap = lhnPolicies ?? {};
        const reportMetadataMap = lhnReportMetadata ?? {};

        const inputs = Object.keys(reportsMap)
            .map((reportKey) => {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const report = reportsMap[reportKey];
                const nvp = nameValuePairsMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                const isReportArchived = !!nvp?.private_isArchived;

                if (!report || !actions) {
                    return null;
                }

                const lastActorAccountID = report.lastActorAccountID;
                let lastActorDetails: Partial<PersonalDetails> | null = null;
                if (lastActorAccountID && personalDetailsMap[lastActorAccountID]) {
                    lastActorDetails = personalDetailsMap[lastActorAccountID];
                }

                const sortedActions = getSortedReportActions(Object.values(actions), true);
                const lastReportAction = sortedActions.at(0);

                const movedFromReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM) : undefined;
                const movedToReportID = lastReportAction ? getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO) : undefined;
                const movedFromReport = movedFromReportID ? reportsMap[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`] : undefined;
                const movedToReport = movedToReportID ? reportsMap[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`] : undefined;

                const itemPolicy = policiesMap[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const itemReportMetadata = reportMetadataMap[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];

                return {
                    report,
                    lastActorDetails,
                    movedFromReport,
                    movedToReport,
                    itemPolicy,
                    isReportArchived,
                    itemReportMetadata,
                };
            })
            .filter((value): value is NonNullable<typeof value> => value !== null);

        await measureFunction(() => {
            for (const input of inputs) {
                getLastMessageTextForReport({
                    translate: () => '',
                    report: input.report,
                    lastActorDetails: input.lastActorDetails,
                    movedFromReport: input.movedFromReport,
                    movedToReport: input.movedToReport,
                    policy: input.itemPolicy,
                    isReportArchived: input.isReportArchived,
                    policyForMovingExpensesID: undefined,
                    reportMetadata: input.itemReportMetadata,
                    currentUserAccountID: 0,
                });
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 50 reports', async () => {
        const smallDataSet = createSidebarReportsWithActions(50);
        await Onyx.multiSet({
            ...smallDataSet.reports,
            ...(smallDataSet.reportActions ?? {}),
            ...(smallDataSet.reportNameValuePairs ?? {}),
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            const reportsMap = smallDataSet.reports ?? {};
            const actionsMap = smallDataSet.reportActions ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 300 reports', async () => {
        const largeDataSet = createSidebarReportsWithActions(300);
        await Onyx.multiSet({
            ...largeDataSet.reports,
            ...(largeDataSet.reportActions ?? {}),
            ...(largeDataSet.reportNameValuePairs ?? {}),
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            const reportsMap = largeDataSet.reports ?? {};
            const actionsMap = largeDataSet.reportActions ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 500 reports', async () => {
        const dataSet = createSidebarReportsWithActions(500);
        await Onyx.multiSet({
            ...dataSet.reports,
            ...(dataSet.reportActions ?? {}),
            ...(dataSet.reportNameValuePairs ?? {}),
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            const reportsMap = dataSet.reports ?? {};
            const actionsMap = dataSet.reportActions ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 1000 reports', async () => {
        const dataSet = createSidebarReportsWithActions(1000);
        await Onyx.multiSet({
            ...dataSet.reports,
            ...(dataSet.reportActions ?? {}),
            ...(dataSet.reportNameValuePairs ?? {}),
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            const reportsMap = dataSet.reports ?? {};
            const actionsMap = dataSet.reportActions ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });

    test('[SidebarUtils LHN] scaling – 2000 reports', async () => {
        const dataSet = createSidebarReportsWithActions(2000);
        await Onyx.multiSet({
            ...dataSet.reports,
            ...(dataSet.reportActions ?? {}),
            ...(dataSet.reportNameValuePairs ?? {}),
        } as Parameters<typeof Onyx.multiSet>[0]);
        await waitForBatchedUpdates();

        await measureFunction(() => {
            const reportsMap = dataSet.reports ?? {};
            const actionsMap = dataSet.reportActions ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = actionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
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
            const reportsMap = lhnReports ?? {};
            for (const reportKey of Object.keys(reportsMap)) {
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const actions = lhnReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

                if (actions) {
                    getSortedReportActionsForDisplay(actions, true);
                }
            }
        });
    });
});
