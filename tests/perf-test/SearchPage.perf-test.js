import {act, fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import SearchPage from '@pages/SearchPage';
import ComposeProviders from '../../src/components/ComposeProviders';
import OnyxProvider from '../../src/components/OnyxProvider';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import createCollection from '../utils/collections/createCollection';
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

const getMockedReports = (length = 100) =>
    createCollection(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const getMockedPersonalDetails = (length = 100) =>
    createCollection(
        (item) => item.accountID,
        (index) => createPersonalDetails(index),
        length,
    );

const mockedReports = getMockedReports(600);
const mockedBetas = _.values(CONST.BETAS);
const mockedPersonalDetails = getMockedPersonalDetails(100);

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
        <ComposeProviders components={[OnyxProvider]}>
            <SearchPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
                navigation={args.navigation}
            />
        </ComposeProviders>
    );
}

test('[Search Page] should interact when text input changes', async () => {
    const {addListener} = TestHelper.createAddListenerMock();

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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}));
});

test('[Search Page] should render options list', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();
    const smallMockedPersonalDetails = getMockedPersonalDetails(5);

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        await act(triggerTransitionEnd);
        await screen.findByText(smallMockedPersonalDetails['1'].login);
        await screen.findByText(smallMockedPersonalDetails['2'].login);
    };

    const navigation = {addListener};

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: smallMockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
            }),
        )
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}));
});

test('[Search Page] should search in options list', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, mockedPersonalDetails['88'].login);
        await act(triggerTransitionEnd);
        await screen.findByText(mockedPersonalDetails['88'].login);
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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}));
});

test('[Search Page] should click on list item', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('options-selector-input');

        fireEvent.changeText(input, mockedPersonalDetails['4'].login);
        await act(triggerTransitionEnd);
        const optionButton = await screen.findByText(mockedPersonalDetails['4'].login);

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
        .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}));
});
