import {randAmount} from '@ngneat/falso';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Policy, Report} from '@src/types/onyx';
import ModifiedExpenseMessage from '../../src/libs/ModifiedExpenseMessage';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const runs = CONST.PERFORMANCE_TESTS.RUNS;

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Clear out Onyx after each test so that each test starts with a clean state
afterEach(() => {
    Onyx.clear();
});

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const getMockedPolicies = (length = 500) =>
    createCollection<Policy>(
        (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
        (index) => createRandomPolicy(index),
        length,
    );

const mockedReportsMap = getMockedReports(5000) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;
const mockedPoliciesMap = getMockedPolicies(5000) as Record<`${typeof ONYXKEYS.COLLECTION.POLICY}`, Policy>;

test('[ModifiedExpenseMessage] getForReportAction on 5k reports and policies', async () => {
    const reportAction = {
        ...createRandomReportAction(1),
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
        originalMessage: {
            amount: randAmount(),
            currency: CONST.CURRENCY.USD,
            oldAmount: randAmount(),
            oldCurrency: CONST.CURRENCY.USD,
        },
    };

    await Onyx.multiSet({
        ...mockedPoliciesMap,
        ...mockedReportsMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => ModifiedExpenseMessage.getForReportAction(reportAction), {runs});
});
