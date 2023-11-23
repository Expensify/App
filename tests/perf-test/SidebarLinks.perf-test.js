import {fireEvent, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import variables from '../../src/styles/variables';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('../../src/libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation');
jest.mock('../../src/components/Icon/Expensicons');

jest.mock('@react-navigation/native');

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
    return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
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
};

const mockedResponseMap = getMockedReportsMap(500);

const runs = CONST.PERFORMANCE_TESTS.RUNS;

test('should render Sidebar with 500 reports stored', () => {
    const scenario = async () => {
        // Query for the sidebar
        await screen.findByTestId('lhn-options-list');
        /**
         * Query for display names of participants [1, 2].
         * This will ensure that the sidebar renders a list of items.
         */
        await screen.findAllByText('One, Two');
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS],
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                ...mockedResponseMap,
            }),
        )
        .then(() => measurePerformance(<LHNTestUtils.MockedSidebarLinks />, {scenario, runs}));
});

test('should scroll and click some of the items', () => {
    const scenario = async () => {
        const eventData = {
            nativeEvent: {
                contentOffset: {
                    y: variables.optionRowHeight * 5,
                },
                contentSize: {
                    // Dimensions of the scrollable content
                    height: variables.optionRowHeight * 10,
                    width: 100,
                },
                layoutMeasurement: {
                    // Dimensions of the device
                    height: variables.optionRowHeight * 5,
                    width: 100,
                },
            },
        };

        const lhnOptionsList = await screen.findByTestId('lhn-options-list');

        fireEvent.scroll(lhnOptionsList, eventData);
        // find elements that are currently visible in the viewport
        const button1 = await screen.findByTestId('7');
        const button2 = await screen.findByTestId('8');
        fireEvent.press(button1);
        fireEvent.press(button2);
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS],
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                ...mockedResponseMap,
            }),
        )
        .then(() => measurePerformance(<LHNTestUtils.MockedSidebarLinks />, {scenario, runs}));
});
