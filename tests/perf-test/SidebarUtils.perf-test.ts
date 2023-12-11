import Onyx, {OnyxCollection} from 'react-native-onyx';
import {measureFunction} from 'reassure';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails} from '@src/types/onyx';
import Policy from '@src/types/onyx/Policy';
import Report from '@src/types/onyx/Report';
import ReportAction from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
);

const mockedResponseMap = getMockedReports(5000) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;
const runs = CONST.PERFORMANCE_TESTS.RUNS;

test('[SidebarUtils] getOptionData on 5k reports', async () => {
    const report = createRandomReport(1);
    const preferredLocale = 'en';
    const policy = createRandomPolicy(1);
    const parentReportAction = createRandomReportAction(1);

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOptionData(report, reportActions, personalDetails, preferredLocale, policy, parentReportAction), {runs});
});

test('[SidebarUtils] getOrderedReportIDs on 5k reports', async () => {
    const currentReportId = '1';
    const allReports = getMockedReports();
    const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS];

    const policies = createCollection<Policy>(
        (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
        (index) => createRandomPolicy(index),
    );

    const allReportActions = Object.fromEntries(
        Object.keys(reportActions).map((key) => [
            key,
            [
                {
                    errors: reportActions[key].errors ?? [],
                    message: [
                        {
                            moderationDecision: {
                                decision: reportActions[key].message?.[0]?.moderationDecision?.decision,
                            },
                        },
                    ],
                },
            ],
        ]),
    ) as unknown as OnyxCollection<ReportAction[]>;

    Onyx.multiSet({
        ...mockedResponseMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => SidebarUtils.getOrderedReportIDs(currentReportId, allReports, betas, policies, CONST.PRIORITY_MODE.DEFAULT, allReportActions), {runs});
});
