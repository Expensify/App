import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, screen} from '@testing-library/react-native';
import React, {useMemo} from 'react';
import type {ComponentType} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OptionListContextProvider, {OptionsListContext} from '@components/OptionListContextProvider';
import {KeyboardStateProvider} from '@components/withKeyboardState';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import {createOptionList} from '@libs/OptionsListUtils';
import ComposeProviders from '@src/components/ComposeProviders';
import OnyxProvider from '@src/components/OnyxProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomReport from '../utils/collections/reports';
import createAddListenerMock from '../utils/createAddListenerMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Todo [Search] Either migrate this test to tests new SearchRouter or remove it completely.

jest.mock('lodash/debounce', () =>
    jest.fn((fn: Record<string, jest.Mock>) => {
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

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
    };
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
// mock of useDismissedReferralBanners
jest.mock('../../src/hooks/useDismissedReferralBanners', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        isDismissed: false,
        setAsDismissed: () => {},
    })),
}));

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
const mockedOptions = createOptionList(mockedPersonalDetails, mockedReports);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT],
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
});

function ChatFinderPageWrapper(args: any) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, KeyboardStateProvider]}>
            <OptionListContextProvider>
                <View />
                {/* <ChatFinderPage */}
                {/*    // eslint-disable-next-line react/jsx-props-no-spreading */}
                {/*    {...args} */}
                {/*    navigation={args.navigation} */}
                {/* /> */}
            </OptionListContextProvider>
        </ComposeProviders>
    );
}

function ChatFinderPageWithCachedOptions(args: any) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
            <OptionsListContext.Provider value={useMemo(() => ({options: mockedOptions, initializeOptions: () => {}, areOptionsInitialized: true}), [])}>
                {/* <ChatFinderPage */}
                {/*    // eslint-disable-next-line react/jsx-props-no-spreading */}
                {/*    {...args} */}
                {/*    navigation={args.navigation} */}
                {/* /> */}
            </OptionsListContext.Provider>
        </ComposeProviders>
    );
}

test('[ChatFinderPage] should render list with cached options', async () => {
    const {addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('ChatFinderPage'); // Todo [Search] fix testID no longer existing
    };

    // const navigation = {addListener} as unknown as StackNavigationProp<RootStackParamList, 'ChatFinder', undefined>;

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
            }),
        )
        .then(() => measureRenders(<ChatFinderPageWithCachedOptions route={{key: 'ChatFinder_Root', name: 'ChatFinder'}} />, {scenario}));
});

test('[ChatFinderPage] should interact when text input changes', async () => {
    const {addListener} = createAddListenerMock();

    const scenario = async () => {
        await screen.findByTestId('ChatFinderPage');

        const input = screen.getByTestId('selection-list-text-input');
        fireEvent.changeText(input, 'Email Four');
        fireEvent.changeText(input, 'Report');
        fireEvent.changeText(input, 'Email Five');
    };

    // const navigation = {addListener} as unknown as StackNavigationProp<RootStackParamList, 'ChatFinder', undefined>;

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: true,
            }),
        )
        .then(() =>
            measureRenders(
                <ChatFinderPageWrapper
                    route={{key: 'ChatFinder_Root', name: 'ChatFinder'}}
                    // navigation={navigation}
                />,
                {scenario},
            ),
        );
});
