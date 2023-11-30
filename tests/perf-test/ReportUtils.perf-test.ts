import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const runs = 20;

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

test('getReportRecipientAccountIDs', async () => {
    const report = createRandomReport(1);
    const currentLoginAccountID = 1;

    await waitForBatchedUpdates();
    await measureFunction(() => ReportUtils.getReportRecipientAccountIDs(report, currentLoginAccountID), {runs});
});
