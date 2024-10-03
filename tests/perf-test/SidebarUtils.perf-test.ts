import {rand} from '@ngneat/falso';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getReportActionMessage} from '@libs/ReportActionsUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, TransactionViolation} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction, {getRandomDate} from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 15000;
const REPORT_TRESHOLD = 5;
const PERSONAL_DETAILS_LIST_COUNT = 1000;

const allReports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        ...createRandomReport(index),
        type: rand(Object.values(CONST.REPORT.TYPE)),
        lastVisibleActionCreated: getRandomDate(),
        // add status and state to every 5th report to mock nonarchived reports
        statusNum: index % REPORT_TRESHOLD ? 0 : CONST.REPORT.STATUS_NUM.CLOSED,
        stateNum: index % REPORT_TRESHOLD ? 0 : CONST.REPORT.STATE_NUM.APPROVED,
        isUnreadWithMention: false,
    }),
    REPORTS_COUNT,
);

const reportActions = createCollection<ReportAction>(
    (item) => item.reportActionID,
    (index) => createRandomReportAction(index),
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

const allReportActions = Object.fromEntries(
    Object.keys(reportActions).map((key) => [
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key}`,
        [
            {
                errors: reportActions[key].errors ?? [],
                message: [
                    {
                        moderationDecision: {
                            decision: getReportActionMessage(reportActions[key])?.moderationDecision?.decision,
                        },
                    },
                ],
                reportActionID: reportActions[key].reportActionID,
            },
        ],
    ]),
) as unknown as OnyxCollection<ReportAction[]>;

const currentReportId = '1';
const transactionViolations = {} as OnyxCollection<TransactionViolation[]>;

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[SidebarUtils] getOptionData', async () => {
        const report = createRandomReport(1);
        const preferredLocale = 'en';
        const policy = createRandomPolicy(1);
        const parentReportAction = createRandomReportAction(1);

        await waitForBatchedUpdates();

        await measureFunction(() =>
            SidebarUtils.getOptionData({
                report,
                reportActions,
                personalDetails,
                preferredLocale,
                policy,
                parentReportAction,
                hasViolations: false,
            }),
        );
    });

    test('[SidebarUtils] getOrderedReportIDs on 15k reports for default priorityMode', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() =>
            SidebarUtils.getOrderedReportIDs(currentReportId, allReports, mockedBetas, policies, CONST.PRIORITY_MODE.DEFAULT, allReportActions, transactionViolations),
        );
    });

    test('[SidebarUtils] getOrderedReportIDs on 15k reports for GSD priorityMode', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => SidebarUtils.getOrderedReportIDs(currentReportId, allReports, mockedBetas, policies, CONST.PRIORITY_MODE.GSD, allReportActions, transactionViolations));
    });
});
