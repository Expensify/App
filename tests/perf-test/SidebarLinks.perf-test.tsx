import {fireEvent, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
}));
jest.mock('../../src/libs/Navigation/navigationRef', () => ({
    getState: () => ({
        routes: [],
    }),
}));
jest.mock('@components/Icon/Expensicons');

jest.mock('@react-navigation/native');

const getMockedReportsMap = (length = 100) => {
    const mockReports = Object.fromEntries(
        Array.from({length}, (value, index) => {
            const reportID = index + 1;
            const participants = [1, 2];
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            const report = {...LHNTestUtils.getFakeReport(participants, 1, true), lastMessageText: 'hey'};

            return [reportKey, report];
        }),
    );

    return mockReports;
};

const mockedResponseMap = getMockedReportsMap(5);

describe('SidebarLinks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);

        // Initialize the network key for OfflineWithFeedback
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(waitForBatchedUpdates);
    });

    afterEach(() => {
        Onyx.clear();
    });

    test('[SidebarLinks] should render Sidebar with 500 reports stored', async () => {
        const scenario = async () => {
            // Query for the sidebar
            await screen.findByTestId('lhn-options-list');
        };

        await waitForBatchedUpdates();

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario, runs: 1});
    });

    test('[SidebarLinks] should render list itmes', async () => {
        const scenario = async () => {
            /**
             * Query for display names of participants [1, 2].
             * This will ensure that the sidebar renders a list of items.
             */
            await screen.findAllByText('Email Two');
        };

        await waitForBatchedUpdates();

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should scroll through the list of items ', async () => {
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
        };

        await waitForBatchedUpdates();

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should click on list item', async () => {
        const scenario = async () => {
            const button = await screen.findByTestId('1');
            fireEvent.press(button);
        };

        await waitForBatchedUpdates();

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
