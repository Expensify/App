/* eslint-disable @typescript-eslint/naming-convention */
import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {addSeconds, format, subMinutes, subSeconds} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import React from 'react';
import {AppState, DeviceEventEmitter, Linking} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import LocalNotification from '@libs/Notification/LocalNotification';
import * as NumberUtils from '@libs/NumberUtils';
import * as Pusher from '@libs/Pusher/pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import FontUtils from '@styles/utils/FontUtils';
import * as AppActions from '@userActions/App';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import App from '@src/App';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import appSetup from '@src/setup';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(30000);

jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    createAnimatedPropAdapter: jest.fn,
    useReducedMotion: jest.fn,
}));

/**
 * We need to keep track of the transitionEnd callback so we can trigger it in our tests
 */
let transitionEndCB: () => void;

type ListenerMock = {
    triggerTransitionEnd: () => void;
    addListener: jest.Mock;
};

/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * The reason we need this is because we need to trigger the transitionEnd event in our tests to simulate
 * the transitionEnd event that is triggered when the screen transition animation is completed.
 *
 * P.S: This can't be moved to a utils file because Jest wants any external function to stay in the scope.
 *
 * @returns An object with two functions: triggerTransitionEnd and addListener
 */
const createAddListenerMock = (): ListenerMock => {
    const transitionEndListeners: Array<() => void> = [];
    const triggerTransitionEnd = () => {
        transitionEndListeners.forEach((transitionEndListener) => transitionEndListener());
    };

    const addListener: jest.Mock = jest.fn().mockImplementation((listener, callback) => {
        if (listener === 'transitionEnd') {
            transitionEndListeners.push(callback);
        }
        return () => {
            transitionEndListeners.filter((cb) => cb !== callback);
        };
    });

    return {triggerTransitionEnd, addListener};
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    const {triggerTransitionEnd, addListener} = createAddListenerMock();
    transitionEndCB = triggerTransitionEnd;

    const useNavigation = () =>
        ({
            navigate: jest.fn(),
            ...actualNav.useNavigation,
            getState: () => ({
                routes: [],
            }),
            addListener,
        } as typeof NativeNavigation.useNavigation);

    return {
        ...actualNav,
        useNavigation,
        getState: () => ({
            routes: [],
        }),
    } as typeof NativeNavigation;
});

const fetchMock = TestHelper.getGlobalFetchMock();

beforeAll(() => {
    global.fetch = fetchMock;

    Linking.setInitialURL('https://new.expensify.com/');
    appSetup();

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    });
});

function scrollToOffset(offset: number) {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(screen.getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: offset,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: 500,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: 700,
                width: 300,
            },
        },
    });
}

function navigateToSidebar(): Promise<void> {
    const hintText = Localize.translateLocal('accessibilityHints.navigateToChatsList');
    const reportHeaderBackButton = screen.queryByAccessibilityHint(hintText);
    if (reportHeaderBackButton) {
        fireEvent(reportHeaderBackButton, 'press');
    }
    return waitForBatchedUpdates();
}

async function navigateToSidebarOption(index: number): Promise<void> {
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    const optionRows = screen.queryAllByAccessibilityHint(hintText);
    fireEvent(optionRows[index], 'press');
    await waitForBatchedUpdatesWithAct();
}

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';

/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
function signInAndGetApp(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    return waitForBatchedUpdatesWithAct()
        .then(async () => {
            await waitForBatchedUpdatesWithAct();
            const hintText = Localize.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            return waitForBatchedUpdatesWithAct();
        })
        .then(() => {
            User.subscribeToUserEvents();
            return waitForBatchedUpdates();
        })
        .then(async () => {
            // Simulate setting an unread report and personal details
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                lastMessageText: 'Test',
                participants: {[USER_B_ACCOUNT_ID]: {hidden: false}},
                lastActorAccountID: USER_B_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            });

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
            });

            // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
            AppActions.setSidebarLoaded();

            return waitForBatchedUpdatesWithAct();
        });
}

describe('Pagination', () => {
    afterEach(async () => {
        await Onyx.clear();

        // Unsubscribe to pusher channels
        PusherHelper.teardown();

        await waitForBatchedUpdatesWithAct();

        jest.clearAllMocks();
    });

    it('opens a chat and load initial messages', async () => {
        await signInAndGetApp();
        await navigateToSidebarOption(0);
        await act(() => transitionEndCB?.());
    });
});
