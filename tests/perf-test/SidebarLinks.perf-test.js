import {measurePerformance} from 'reassure';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

jest.mock('../../src/libs/Permissions');
jest.mock('../../src/components/Icon/Expensicons');

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
    },
    NETWORK: 'network',
};

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        registerStorageEventListener: () => {},
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}));

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

test('simple Sidebar render with hundred of reports', () => {
    const mockReports = Array.from({length: 100}, (__, i) => {
        const reportID = i + 1;
        const emails = [`email${reportID}@test.com`];
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = LHNTestUtils.getFakeReport(emails, 1, false);
        return {[reportKey]: report};
    });
    const mockOnyxReports = _.assign({}, ...mockReports);

    return waitForPromisesToResolve()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                ...mockOnyxReports,
            }),
        )
        .then(() => measurePerformance(<LHNTestUtils.MockedSidebarLinks />));
});
