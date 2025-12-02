import {randAmount} from '@ngneat/falso';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import {getForReportAction} from '../../src/libs/ModifiedExpenseMessage';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Clear out Onyx after each test so that each test starts with a clean state
afterEach(() => {
    Onyx.clear();
});

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index, undefined),
        length,
    );

const getMockedPolicies = (length = 500) =>
    createCollection<Policy>(
        (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
        (index) => createRandomPolicy(index),
        length,
    );

const mockedReportsMap = getMockedReports(1000) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;
const mockedPoliciesMap = getMockedPolicies(1000) as Record<`${typeof ONYXKEYS.COLLECTION.POLICY}`, Policy>;

test('[ModifiedExpenseMessage] getForReportAction on 1k reports and policies', async () => {
    const report = createRandomReport(1, undefined);
    const reportAction = {
        ...createRandomReportAction(1),
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
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
    await measureFunction(() => getForReportAction({reportAction, policyID: report.policyID}));
});
