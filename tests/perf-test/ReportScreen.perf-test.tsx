import type {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {screen, waitFor} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import {measurePerformance} from 'reassure';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import ComposeProviders from '@src/components/ComposeProviders';
import DragAndDropProvider from '@src/components/DragAndDrop/Provider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@src/components/withCurrentReportID';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import {WindowDimensionsProvider} from '@src/components/withWindowDimensions';
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
import PusherHelper from '../utils/PusherHelper';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type ReportScreenWrapperProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>;

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
    const actualNav = jest.requireActual('react-native-reanimated/mock');
    return {
        ...actualNav,
        useSharedValue: jest.fn,
        useAnimatedStyle: jest.fn,
        useAnimatedRef: jest.fn,
    } as typeof Animated;
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
}));
jest.mock('@src/hooks/usePermissions.ts');

jest.mock('@src/libs/Navigation/Navigation', () => ({
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
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
    } as typeof Navigation;
});

// mock PortalStateContext
jest.mock('@gorhom/portal');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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
        <ComposeProviders
            components={[
                OnyxProvider,
                CurrentReportIDContextProvider,
                KeyboardStateProvider,
                WindowDimensionsProvider,
                LocaleContextProvider,
                DragAndDropProvider,
                ReportAttachmentsProvider,
            ]}
        >
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

test('[ReportScreen] should render ReportScreen', () => {
    const {triggerTransitionEnd, addListener} = TestHelper.createAddListenerMock();
    const scenario = async () => {
        /**
         * First make sure ReportScreen is mounted, so that we can trigger
         * the transitionEnd event manually.
         *
         * If we don't do that, then the transitionEnd event will be triggered
         * before the ReportScreen is mounted, and the test will fail.
         */
        await screen.findByTestId('ReportScreen');
        await waitFor(triggerTransitionEnd);

        // Query for the composer
        await screen.findByTestId('composer');

        // Query for the report list
        await screen.findByTestId('report-actions-list');
    };

    const navigation = {addListener} as unknown as StackNavigationProp<CentralPaneNavigatorParamList, 'Report', undefined>;

    return waitForBatchedUpdates()
        .then(() => {
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
            };

            const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
            };

            return Onyx.multiSet({
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
                [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
                ...reportCollectionDataSet,
                ...reportActionsCollectionDataSet,
            });
        })
        .then(() =>
            measurePerformance(
                <ReportScreenWrapper
                    navigation={navigation}
                    route={mockRoute}
                />,
                {scenario},
            ),
        );
});
