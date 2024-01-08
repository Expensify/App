import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import SearchPage from '@pages/SearchPage';
import createRandomReport from '../utils/collections/reports';
import ComposeProviders from '../../src/components/ComposeProviders';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '../../src/components/withCurrentReportID';
import {KeyboardStateProvider} from '../../src/components/withKeyboardState';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('../../src/components/withNavigationFocus', () => (Component) => {
    function WithNavigationFocus(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

jest.mock('../../src/libs/Navigation/Navigation');

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => ({
            navigate: mockedNavigate,
        }),
        useRoute: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});

const getMockedReportsMap = (length = 100) => {
    const mockReports = Array.from({length}, (__, i) => {
        const reportID = i + 1;
        const report = createRandomReport(reportID)
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;

        return {[reportKey]: report};
    });

    return _.assign({}, ...mockReports);
};

const mockedReports = getMockedReportsMap(500);
const mockedBetas = _.values(CONST.BETAS);
const mockedPersonalDetails = LHNTestUtils.fakePersonalDetails;


beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT],
        registerStorageEventListener: () => {},
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

// Clear out Onyx after each test so that each test starts with a clean state
afterEach(() => {
    Onyx.clear();
    PusherHelper.teardown();
});

function SearchPageWrapper() {
    return (
        <ComposeProviders
            components={[
                OnyxProvider,
                CurrentReportIDContextProvider,
                KeyboardStateProvider,
                WindowDimensionsProvider,
                LocaleContextProvider,
            ]}
        >
            <SearchPage/>
        </ComposeProviders>
    );
}

const runs = CONST.PERFORMANCE_TESTS.RUNS;
 
 test('[Search Page] should interact when text input changes', () => {
    const scenario = async () => {
        await screen.findByTestId('SearchPage');

        const input = screen.getByTestId('options-selector-input');
        
        fireEvent.changeText(input, 'Email Four');
        fireEvent.changeText(input, 'Report');
        fireEvent.changeText(input, 'Email Five');

    };
    

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
            }),
        )
        .then(() =>
            measurePerformance(
                <SearchPageWrapper/>,
                {scenario, runs},
            ),
        );
}); 


test('[Search Page] should render options list', () => {
    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, 'email5@test.com');
        await screen.findByText('email5@test.com');
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,

            }),
        )
        .then(() => measurePerformance(<SearchPageWrapper />, {scenario, runs}));
});

test('[Search Page] should click on list item', () => {
    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, 'email6@test.com');
        const optionButton = await screen.findByText('email6@test.com');

        fireEvent.press(optionButton);
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
            }),
        )
        .then(() => measurePerformance(<SearchPageWrapper />, {scenario, runs}));
});
