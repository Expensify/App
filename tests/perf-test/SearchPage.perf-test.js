import {act, fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import SearchPage from '@pages/SearchPage';
import ComposeProviders from '../../src/components/ComposeProviders';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '../../src/components/withCurrentReportID';
import {KeyboardStateProvider} from '../../src/components/withKeyboardState';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomReport from '../utils/collections/reports';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

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
        const report = createRandomReport(reportID);
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;

        return {[reportKey]: report};
    });

    return _.assign({}, ...mockReports);
};

const getMockedPersonalDetailsMap = (length) => {
    const mockPersonalDetails = Array.from({length}, (__, i) => {
        const personalDetailsKey = i + 1;
        const personalDetails = createPersonalDetails(personalDetailsKey);
        return {[personalDetailsKey]: personalDetails};
    });

    return _.assign({}, ...mockPersonalDetails);
};

const mockedReports = getMockedReportsMap(600);
const mockedBetas = _.values(CONST.BETAS);
const mockedPersonalDetails = getMockedPersonalDetailsMap(10);

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

function SearchPageWrapper(args) {
    return (
        <ComposeProviders components={[OnyxProvider, CurrentReportIDContextProvider, KeyboardStateProvider, WindowDimensionsProvider, LocaleContextProvider]}>
            <SearchPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
                navigation={args.navigation}
            />
        </ComposeProviders>
    );
}

const runs = CONST.PERFORMANCE_TESTS.RUNS;

/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * Same approach as in ReportScreen.perf-test.js
 *
 * P.S: This can't be moved to a utils file because Jest wants any external function to stay in the scope.
 *
 * @returns {Object} An object with two functions: triggerTransitionEnd and addListener
 */
const createAddListenerMock = () => {
    const transitionEndListeners = [];
    const triggerTransitionEnd = () => {
        transitionEndListeners.forEach((transitionEndListener) => transitionEndListener());
    };

    const addListener = jest.fn().mockImplementation((listener, callback) => {
        if (listener === 'transitionEnd') {
            transitionEndListeners.push(callback);
        }
        return () => {
            _.filter(transitionEndListeners, (cb) => cb !== callback);
        };
    });

    return {triggerTransitionEnd, addListener};
};

test('[Search Page] should interact when text input changes', async () => {
    const {addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');

        const input = screen.getByTestId('options-selector-input');
        fireEvent.changeText(input, 'Email Four');
        fireEvent.changeText(input, 'Report');
        fireEvent.changeText(input, 'Email Five');
    };

    const navigation = {addListener};

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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario, runs}));
});

test('[Search Page] should render options list', async () => {
    const {triggerTransitionEnd, addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        await act(triggerTransitionEnd);
        await screen.findByText(mockedPersonalDetails['1'].login);
        await screen.findByText(mockedPersonalDetails['2'].login);
    };

    const navigation = {addListener};

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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario, runs}));
});

test('[Search Page] should search in options list', async () => {
    const {triggerTransitionEnd, addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, mockedPersonalDetails['5'].login);
        await act(triggerTransitionEnd);
        await screen.findByText(mockedPersonalDetails['5'].login);

        fireEvent.changeText(input, mockedPersonalDetails['8'].login);
        await act(triggerTransitionEnd);
        await screen.findByText(mockedPersonalDetails['8'].login);

        fireEvent.changeText(input, mockedPersonalDetails['2'].login);
        await act(triggerTransitionEnd);
        await screen.findByText(mockedPersonalDetails['2'].login);
    };

    const navigation = {addListener};

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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario, runs}));
});

test('[Search Page] should click on list item', async () => {
    const {triggerTransitionEnd, addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, mockedPersonalDetails['6'].login);
        await act(triggerTransitionEnd);
        const optionButton = await screen.findByText(mockedPersonalDetails['6'].login);

        fireEvent.press(optionButton);
    };

    const navigation = {addListener};
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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario, runs}));
});
