import {rand} from '@ngneat/falso';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
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
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 15000;
const REPORT_THRESHOLD = 5;
const PERSONAL_DETAILS_LIST_COUNT = 1000;

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

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: 'en',
        });
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
                chatReport: undefined,
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
});
