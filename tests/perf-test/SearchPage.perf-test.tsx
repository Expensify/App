import type * as NativeNavigation from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import {fireEvent, screen, waitFor} from '@testing-library/react-native';
import type {TextMatch} from '@testing-library/react-native/build/matches';
import React from 'react';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type {RootStackParamList} from '@libs/Navigation/types';
import SearchPage from '@pages/SearchPage';
import ComposeProviders from '@src/components/ComposeProviders';
import OnyxProvider from '@src/components/OnyxProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Beta, PersonalDetails, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomReport from '../utils/collections/reports';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('lodash/debounce', () =>
    jest.fn((fn: Record<string, jest.Mock<jest.Func>>) => {
        // eslint-disable-next-line no-param-reassign
        fn.cancel = jest.fn();
        return fn;
    }),
);

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation');

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
    } as typeof NativeNavigation;
});

jest.mock('@src/components/withNavigationFocus', () => (Component: ComponentType<WithNavigationFocusProps>) => {
    function WithNavigationFocus(props: WithNavigationFocusProps) {
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
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const getMockedPersonalDetails = (length = 100) =>
    createCollection<PersonalDetails>(
        (item) => item.accountID,
        (index) => createPersonalDetails(index),
        length,
    );

const mockedReports = getMockedReports(600);
const mockedBetas = Object.values(CONST.BETAS);
const mockedPersonalDetails = getMockedPersonalDetails(100);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT],
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

// Clear out Onyx after each test so that each test starts with a clean state
afterEach(() => {
    Onyx.clear();
    PusherHelper.teardown();
});

type SearchPageProps = StackScreenProps<RootStackParamList, typeof SCREENS.SEARCH_ROOT> & {
    betas: OnyxEntry<Beta[]>;
    reports: OnyxCollection<Report>;
    isSearchingForReports: OnyxEntry<boolean>;
};

function SearchPageWrapper(args: SearchPageProps) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
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

        const input = screen.getByTestId('selection-list-text-input');
        fireEvent.changeText(input, 'Email Four');
        fireEvent.changeText(input, 'Report');
        fireEvent.changeText(input, 'Email Five');
    };

    const navigation = {addListener};

    return (
        waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    ...mockedReports,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                    [ONYXKEYS.BETAS]: mockedBetas,
                    [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
                }),
            )
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}))
    );
});

test('[Search Page] should render selection list', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();
    const smallMockedPersonalDetails = getMockedPersonalDetails(5);

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        await waitFor(triggerTransitionEnd as Awaited<() => Promise<void>>);
        await screen.findByTestId('selection-list');
        await screen.findByText(smallMockedPersonalDetails['1'].login as TextMatch);
        await screen.findByText(smallMockedPersonalDetails['2'].login as TextMatch);
    };

    const navigation = {addListener};

    return (
        waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    ...mockedReports,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: smallMockedPersonalDetails,
                    [ONYXKEYS.BETAS]: mockedBetas,
                    [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
                }),
            )
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}))
    );
});

test('[Search Page] should search in selection list', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        await waitFor(triggerTransitionEnd as Awaited<() => Promise<void>>);

        const input = screen.getByTestId('selection-list-text-input');
        const searchValue = mockedPersonalDetails['88'].login;

        fireEvent.changeText(input, searchValue);
        await screen.findByText(searchValue as TextMatch);
    };

    const navigation = {addListener};

    return (
        waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    ...mockedReports,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                    [ONYXKEYS.BETAS]: mockedBetas,
                    [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
                }),
            )
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}))
    );
});

test('[Search Page] should click on list item', async () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('SearchPage');
        const input = screen.getByTestId('selection-list-text-input');
        await waitFor(triggerTransitionEnd as Awaited<() => Promise<void>>);

        const searchValue = mockedPersonalDetails['4'].login as TextMatch;
        fireEvent.changeText(input, searchValue);

        const optionButton = await screen.findByText(searchValue);
        fireEvent.press(optionButton);
    };

    const navigation = {addListener};
    return (
        waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    ...mockedReports,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                    [ONYXKEYS.BETAS]: mockedBetas,
                    [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
                }),
            )
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            .then(() => measurePerformance(<SearchPageWrapper navigation={navigation} />, {scenario}))
    );
});
