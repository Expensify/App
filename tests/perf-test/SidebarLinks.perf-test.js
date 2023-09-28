import {measurePerformance} from 'reassure';
import Onyx from 'react-native-onyx';
import {screen} from '@testing-library/react-native';
import _ from 'underscore';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('../../src/libs/Permissions');
jest.mock('../../src/components/Icon/Expensicons');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {},
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false})
});

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

const getMockedReportsMap = (length = 100) => {
    const mockReports = Array.from({length}, (__, i) => {
        const reportID = i + 1;
        const participants = [1, 2];
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = LHNTestUtils.getFakeReport(participants, 1, true);

        return {[reportKey]: report};
    });
    
    return _.assign({}, ...mockReports);
}

test('should render Sidebar with 500 reports stored', () => {
    const scenario = async () => {
        /**
         * Query for display names of participants [1, 2]. 
         * This will ensure that the sidebar renders a list of items.
         */
        await screen.findAllByText('One, Two');
    }

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS],
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                ...getMockedReportsMap(500),
            }),
        )
        .then(() => measurePerformance(<LHNTestUtils.MockedSidebarLinks />, {scenario}));
});
