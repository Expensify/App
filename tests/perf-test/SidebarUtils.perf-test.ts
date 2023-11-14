import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Policy from '@src/types/onyx/Policy';
import Report from '@src/types/onyx/Report';
import ReportAction from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.setTimeout(120000);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `report_${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    ) as Partial<Report>;

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const mockedResponseMap = getMockedReports(10000);

test('getOptionData on 10k reports', async () => {
    const report = createRandomReport(1);
    const personalDetails = LHNTestUtils.fakePersonalDetails;
    const preferredLocale = 'en';
    const policy = createRandomPolicy(1);
    const parentReportAction = createRandomReportAction(1);

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOptionData(report, reportActions, personalDetails, preferredLocale, policy, parentReportAction), {runs: 20});
});

test('getOrderedReportIDs on 10k reports', async () => {
    const currentReportId = '1';
    const allReports = getMockedReports() as Record<string, Report>;
    const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS];

    const policies = createCollection<Policy>(
        (item) => `policy_${item.id}`,
        (index) => createRandomPolicy(index),
    );

    const allReportActions = Object.values(reportActions).map((reportAction) => ({
        errors: reportAction.errors ?? [],
        message: [
            {
                moderationDecision: {
                    decision: reportAction.message?.[0]?.moderationDecision?.decision,
                },
            },
        ],
    })) as unknown as Record<string, ReportAction[]>;

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOrderedReportIDs(currentReportId, allReports, betas, policies, CONST.PRIORITY_MODE.DEFAULT, allReportActions), {runs: 20});
});
