import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Policy from '@src/types/onyx/Policy';
import Report from '@src/types/onyx/Report';
import ReportAction from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.setTimeout(60000);

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

const getMockedReportsMap = (length = 100) => {
    const mockReports = Array.from({length}, (v, i) => {
        const reportID = i + 1;
        const participants = [1, 2];
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = LHNTestUtils.getFakeReportWithPolicy(participants, 1, true);

        return {[reportKey]: report};
    });

    return Object.assign({}, ...mockReports) as Partial<Report>;
};

const getMockedPoliciesMap = (length = 100) => {
    const mockPolicies = Array.from({length}, (v, i) => {
        const policyID = i + 1;
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const policy = LHNTestUtils.getFakePolicy();

        return {[policyKey]: policy};
    });

    return Object.assign({}, ...mockPolicies) as Record<string, Policy>;
};

const mockedResponseMap = getMockedReportsMap(1000);

test('getOptionData on 1k reports', async () => {
    const report = LHNTestUtils.getFakeReportWithPolicy([1, 2], 1, true) as Report;
    const reportActions = ReportTestUtils.getMockedReportsMap();
    const personalDetails = LHNTestUtils.fakePersonalDetails;
    const preferredLocale = 'en';
    const policy = LHNTestUtils.getFakePolicy() as Policy;
    const reportAction = ReportTestUtils.getFakeReportAction(1, 'ADDCOMMENT') as unknown as ReportAction;

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOptionData(report, reportActions, personalDetails, preferredLocale, policy, reportAction), {runs: 20});
});

test('getOrderedReportIDs on 1k reports', async () => {
    const currentReportId = '1';
    const allReports = getMockedReportsMap() as Record<string, Report>;
    const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS];
    const policies = getMockedPoliciesMap();
    const reportActions = ReportTestUtils.getMockedReportsMap();

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOrderedReportIDs(currentReportId, allReports, betas, policies, CONST.PRIORITY_MODE.DEFAULT, reportActions), {runs: 20});
});
