import {fireEvent, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('@hooks/usePermissions.ts');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
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

const mockedResponseMap = getMockedReportsMap(500);

describe('SidebarLinks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });
    });

    // Initialize the network key for OfflineWithFeedback
    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[SidebarLinks] should render Sidebar with 500 reports stored', async () => {
        const scenario = async () => {
            // Query for the sidebar
            await screen.findByTestId('lhn-options-list');
            /**
             * Query for display names of participants [1, 2].
             * This will ensure that the sidebar renders a list of items.
             */
            await screen.findAllByText('One, Two');
        };

        await waitForBatchedUpdates();
        await measurePerformance(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should scroll and click some of the items', async () => {
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

        await waitForBatchedUpdates();

        await measurePerformance(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
