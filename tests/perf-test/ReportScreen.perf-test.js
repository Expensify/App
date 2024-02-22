import {fireEvent, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '../../src/components/ComposeProviders';
import DragAndDropProvider from '../../src/components/DragAndDrop/Provider';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '../../src/components/withCurrentReportID';
import {KeyboardStateProvider} from '../../src/components/withKeyboardState';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import {ReportAttachmentsProvider} from '../../src/pages/home/report/ReportAttachmentsContext';
import ReportScreen from '../../src/pages/home/ReportScreen';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import PusherHelper from '../utils/PusherHelper';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual('react-native-reanimated/mock'),
    useSharedValue: jest.fn,
    useAnimatedStyle: jest.fn,
    useAnimatedRef: jest.fn,
}));

jest.mock('../../src/components/ConfirmedRoute.tsx');

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

jest.mock('../../src/hooks/useEnvironment', () =>
    jest.fn(() => ({
        environment: 'development',
        environmentURL: 'https://new.expensify.com',
        isProduction: false,
        isDevelopment: true,
    })),
);

jest.mock('../../src/libs/Permissions', () => ({
    canUseLinkPreviews: jest.fn(() => true),
    canUseDefaultRooms: jest.fn(() => true),
}));
jest.mock('../../src/hooks/usePermissions.ts');

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

// mock PortalStateContext
jest.mock('@gorhom/portal');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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

const policies = createCollection(
    (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
    (index) => createRandomPolicy(index),
    10,
);

const personalDetails = createCollection(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    20,
);

function ReportScreenWrapper(args) {
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
                {...args}
                navigation={args.navigation}
            />
        </ComposeProviders>
    );
}

const report = {...createRandomReport(1), policyID: '1'};
const reportActions = ReportTestUtils.getMockedReportActionsMap(500);
const mockRoute = {params: {reportID: '1'}};

test('[ReportScreen] should render ReportScreen with composer interactions', () => {
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
        const composer = await screen.findByTestId('composer');

        // Type in the composer
        fireEvent.changeText(composer, 'Test message');

        const hintSendButtonText = Localize.translateLocal('common.send');

        // Query for the send button
        const sendButton = await screen.findByLabelText(hintSendButtonText);

        // Click on the send button
        fireEvent.press(sendButton);

        const hintHeaderText = Localize.translateLocal('common.back');

        // Query for the header
        await screen.findByLabelText(hintHeaderText);
    };

    const navigation = {addListener};

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
                [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            }),
        )
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

test('[ReportScreen] should press of the report item', () => {
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

        // Query for the report list
        await screen.findByTestId('report-actions-list');

        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');

        // Query for the list of items
        const reportItems = await screen.findAllByLabelText(hintText);

        fireEvent.press(reportItems[0], 'onLongPress');
    };

    const navigation = {addListener};

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [`${ONYXKEYS.COLLECTION.POLICY}`]: policies,
            }),
        )
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
