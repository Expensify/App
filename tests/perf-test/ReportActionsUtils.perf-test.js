import {measureFunction} from 'reassure';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';
import * as LHNTestUtils from '../utils/LHNTestUtils';

jest.setTimeout(60000);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {},
    }),
);

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

const getMockedReportActionsMap = (reportsLength = 10, actionsPerReportLength = 100) => {
    const mockReportActions = Array.from({length: actionsPerReportLength}, (__, i) => {
        const reportActionKey = i + 1;
        const email = `actor+${reportActionKey}@mail.com`;
        const reportAction = LHNTestUtils.getFakeReportAction(email);

        return {[reportActionKey]: reportAction};
    });

    const reportKeysMap = Array.from({length: reportsLength}, (__, i) => {
        const key = i + 1;

        return {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key}`]: _.assign({}, ...mockReportActions)};
    });

    return _.assign({}, ...reportKeysMap);
};

const mockedReportActionsMap = getMockedReportActionsMap(2, 10000);

/**
 * This function will be executed 20 times and the average time will be used on the comparison.
 * It will fail based on the CI configuration around Reassure:
 * @see /.github/workflows/reassurePerformanceTests.yml
 *
 * Max deviation on the duration is set to 20% at the time of writing.
 *
 * More on the measureFunction API:
 * @see https://callstack.github.io/reassure/docs/api#measurefunction-function
 */
test('getLastVisibleAction with 10k reportActions stored per report', async () => {
    const reportId = '1';

    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId), {runs: 20});
});
