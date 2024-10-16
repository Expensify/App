import type {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import React from 'react';
import type ReactNative from 'react-native';
import {Dimensions, InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import {measureRenders} from 'reassure';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import ComposeProviders from '@src/components/ComposeProviders';
import DragAndDropProvider from '@src/components/DragAndDrop/Provider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@src/components/withCurrentReportID';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {ReportAttachmentsProvider} from '@src/pages/home/report/ReportAttachmentsContext';
import ReportScreen from '@src/pages/home/ReportScreen';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import createAddListenerMock from '../utils/createAddListenerMock';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type ReportScreenWrapperProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT>;

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
    paginate: jest.fn(),
}));

jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
    runAfterInteractions: () => ({
        cancel: jest.fn(),
    }),
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn(),
}));

jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual<typeof ReactNative>('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualReactNative,
        Dimensions: {
            ...actualReactNative.Dimensions,
            addEventListener: jest.fn(),
        },
    };
});

jest.mock('react-native-reanimated', () => {
    const actualNav = jest.requireActual<typeof Animated>('react-native-reanimated/mock');
    return {
        ...actualNav,
        useSharedValue: jest.fn,
        useAnimatedStyle: jest.fn,
        useAnimatedRef: jest.fn,
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@src/components/withNavigationFocus', <TProps extends WithNavigationFocusProps>() => (Component: ComponentType<TProps>) => {
    function WithNavigationFocus(props: Omit<TProps, keyof WithNavigationFocusProps>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

jest.mock('@src/hooks/useEnvironment', () =>
    jest.fn(() => ({
        environment: 'development',
        environmentURL: 'https://new.expensify.com',
        isProduction: false,
        isDevelopment: true,
    })),
);

jest.mock('@src/libs/Permissions', () => ({
    canUseLinkPreviews: jest.fn(() => true),
    canUseDefaultRooms: jest.fn(() => true),
    canUseNewSearchRouter: jest.fn(() => true),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getIsReportOpenInRHP: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        useNavigationState: () => {},
        createNavigationContainerRef: jest.fn(),
    };
});

// mock PortalStateContext
jest.mock('@gorhom/portal');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

type MockListener = {
    remove: jest.Mock;
    callback?: () => void;
};

const mockListener: MockListener = {remove: jest.fn()};
let mockCancel: jest.Mock;
let mockRunAfterInteractions: jest.Mock;

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);

    // Reset mocks before each test
    (Dimensions.addEventListener as jest.Mock).mockClear();
    mockListener.remove.mockClear();

    // Mock the implementation of addEventListener to return the mockListener
    (Dimensions.addEventListener as jest.Mock).mockImplementation((event: string, callback: () => void) => {
        if (event === 'change') {
            mockListener.callback = callback;
            return mockListener;
        }
        return {remove: jest.fn()};
    });

    // Mock the implementation of InteractionManager.runAfterInteractions
    mockCancel = jest.fn();
    mockRunAfterInteractions = jest.fn().mockReturnValue({cancel: mockCancel});

    jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(mockRunAfterInteractions);

    // Initialize the network key for OfflineWithFeedback
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    Onyx.clear().then(waitForBatchedUpdates);
});

const policies = createCollection(
    (item: OnyxTypes.Policy) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
    (index: number) => createRandomPolicy(index),
    10,
);

const personalDetails = createCollection(
    (item: OnyxTypes.PersonalDetails) => item.accountID,
    (index: number) => createPersonalDetails(index),
    20,
);

function ReportScreenWrapper(props: ReportScreenWrapperProps) {
    return (
        <ComposeProviders components={[OnyxProvider, CurrentReportIDContextProvider, KeyboardStateProvider, LocaleContextProvider, DragAndDropProvider, ReportAttachmentsProvider]}>
            <ReportScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                route={props.route}
                navigation={props.navigation}
            />
        </ComposeProviders>
    );
}

const report = {...createRandomReport(1), policyID: '1'};
const reportActions = ReportTestUtils.getMockedReportActionsMap(1000);
const mockRoute = {params: {reportID: '1', reportActionID: ''}, key: 'Report', name: 'Report' as const};

test('[ReportScreen] should render ReportScreen', async () => {
    const {addListener} = createAddListenerMock();
    const scenario = async () => {
        await screen.findByTestId(`report-screen-${report.reportID}`);
    };

    const navigation = {addListener} as unknown as StackNavigationProp<AuthScreensParamList, 'Report', undefined>;

    await waitForBatchedUpdates();
    const reportCollectionDataSet: ReportCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
    };
    const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
    };

    Onyx.multiSet({
        [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
        [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
        ...reportCollectionDataSet,
        ...reportActionsCollectionDataSet,
    });
    await measureRenders(
        <ReportScreenWrapper
            navigation={navigation}
            route={mockRoute}
        />,
        {scenario},
    );
});

test('[ReportScreen] should render composer', async () => {
    const {addListener} = createAddListenerMock();
    const scenario = async () => {
        await screen.findByTestId('composer');
    };

    const navigation = {addListener} as unknown as StackNavigationProp<AuthScreensParamList, 'Report', undefined>;

    await waitForBatchedUpdates();

    const reportCollectionDataSet: ReportCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
    };

    const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
    };
    Onyx.multiSet({
        [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
        [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
        ...reportCollectionDataSet,
        ...reportActionsCollectionDataSet,
    });
    await measureRenders(
        <ReportScreenWrapper
            navigation={navigation}
            route={mockRoute}
        />,
        {scenario},
    );
});

test('[ReportScreen] should render report list', async () => {
    const {addListener} = createAddListenerMock();
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
    };

    const navigation = {addListener} as unknown as StackNavigationProp<AuthScreensParamList, 'Report', undefined>;

    await waitForBatchedUpdates();

    const reportCollectionDataSet: ReportCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
    };

    const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
    };

    Onyx.multiSet({
        [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
        [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
        [ONYXKEYS.IS_LOADING_APP]: false,
        [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockRoute.params.reportID}`]: {
            isLoadingInitialReportActions: false,
        },
        ...reportCollectionDataSet,
        ...reportActionsCollectionDataSet,
    });
    await measureRenders(
        <ReportScreenWrapper
            navigation={navigation}
            route={mockRoute}
        />,
        {scenario},
    );
});
