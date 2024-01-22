import {act, fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
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
import * as LHNTestUtils from '../utils/LHNTestUtils';
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

/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * The reason we need this is because we need to trigger the transitionEnd event in our tests to simulate
 * the transitionEnd event that is triggered when the screen transition animation is completed.
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

const runs = CONST.PERFORMANCE_TESTS.RUNS;

test.skip('[ReportScreen] should render ReportScreen with composer interactions', () => {
    const {triggerTransitionEnd, addListener} = createAddListenerMock();
    const scenario = async () => {
        /**
         * First make sure ReportScreen is mounted, so that we can trigger
         * the transitionEnd event manually.
         *
         * If we don't do that, then the transitionEnd event will be triggered
         * before the ReportScreen is mounted, and the test will fail.
         */
        await screen.findByTestId('ReportScreen');

        await act(triggerTransitionEnd);

        // Query for the report list
        await screen.findByTestId('report-actions-list');

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

    const policy = {
        policyID: 1,
        name: 'Testing Policy',
    };

    const report = LHNTestUtils.getFakeReport();
    const reportActions = ReportTestUtils.getMockedReportActionsMap(1000);
    const mockRoute = {params: {reportID: '1'}};

    const navigation = {addListener};

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockRoute.params.reportID}`]: {
                    isLoadingReportActions: false,
                },
            }),
        )
        .then(() =>
            measurePerformance(
                <ReportScreenWrapper
                    navigation={navigation}
                    route={mockRoute}
                />,
                {scenario, runs},
            ),
        );
});

test.skip('[ReportScreen] should press of the report item', () => {
    const {triggerTransitionEnd, addListener} = createAddListenerMock();
    const scenario = async () => {
        /**
         * First make sure ReportScreen is mounted, so that we can trigger
         * the transitionEnd event manually.
         *
         * If we don't do that, then the transitionEnd event will be triggered
         * before the ReportScreen is mounted, and the test will fail.
         */
        await screen.findByTestId('ReportScreen');

        await act(triggerTransitionEnd);

        // Query for the report list
        await screen.findByTestId('report-actions-list');

        // Query for the composer
        await screen.findByTestId('composer');

        const hintReportPreviewText = Localize.translateLocal('iou.viewDetails');

        // Query for report preview buttons
        const reportPreviewButtons = await screen.findAllByLabelText(hintReportPreviewText);

        // click on the report preview button
        fireEvent.press(reportPreviewButtons[0]);
    };

    const policy = {
        policyID: 123,
        name: 'Testing Policy',
    };

    const report = LHNTestUtils.getFakeReport();
    const reportActions = ReportTestUtils.getMockedReportActionsMap(1000);
    const mockRoute = {params: {reportID: '2'}};

    const navigation = {addListener};

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.IS_SIDEBAR_LOADED]: true,
                [`${ONYXKEYS.COLLECTION.REPORT}${mockRoute.params.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockRoute.params.reportID}`]: reportActions,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockRoute.params.reportID}`]: {
                    isLoadingReportActions: false,
                },
            }),
        )
        .then(() =>
            measurePerformance(
                <ReportScreenWrapper
                    navigation={navigation}
                    route={mockRoute}
                />,
                {scenario, runs},
            ),
        );
});
