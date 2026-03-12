import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {init as activeClientManagerInit, isClientTheLeader, isReady} from '@libs/ActiveClientManager';
import AuthScreensInitHandler from '@libs/Navigation/AppNavigator/AuthScreensInitHandler';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import NetworkConnection from '@libs/NetworkConnection';
import Pusher from '@libs/Pusher';
import {didUserLogInDuringSession, isLoggingInAsNewUser} from '@libs/SessionUtils';
import {openApp, reconnectApp} from '@userActions/App';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import {subscribeToUserEvents} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const TEST_ACCOUNT_ID = 1;

jest.mock('@libs/Pusher', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        init: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/PusherConnectionManager', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        init: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isActiveRoute: jest.fn(() => false),
        navigate: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        setNavigationActionToMicrotaskQueue: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/Navigation/currentUrl', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ''),
}));

jest.mock('@libs/SessionUtils', () => ({
    isLoggingInAsNewUser: jest.fn(() => false),
    didUserLogInDuringSession: jest.fn(() => false),
}));

jest.mock('@libs/NetworkConnection', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        listenForReconnect: jest.fn(),
        onReconnect: jest.fn(),
    },
}));

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    init: jest.fn(),
    isReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@userActions/App', () => ({
    openApp: jest.fn(),
    reconnectApp: jest.fn(),
    setUpPoliciesAndNavigate: jest.fn(),
    confirmReadyToOpenApp: jest.fn(),
}));

jest.mock('@userActions/Download', () => ({
    clearDownloads: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    signOutAndRedirectToSignIn: jest.fn(),
    cleanupSession: jest.fn(),
}));

jest.mock('@userActions/User', () => ({
    subscribeToUserEvents: jest.fn(),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(),
    endSpan: jest.fn(),
    getSpan: jest.fn(),
}));

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({initialURL: null, isAuthenticatedAtStartup: false}),
    useInitialURLActions: () => ({setIsAuthenticatedAtStartup: jest.fn()}),
}));

jest.mock('@selectors/Onboarding', () => ({
    hasSeenTourSelector: () => false,
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

const mockedPusherInit = jest.mocked(Pusher.init);
const mockedGetCurrentUrl = jest.mocked(getCurrentUrl);
const mockedIsActiveRoute = jest.mocked(Navigation.isActiveRoute);
const mockedIsLoggingInAsNewUser = jest.mocked(isLoggingInAsNewUser);
const mockedDidUserLogInDuringSession = jest.mocked(didUserLogInDuringSession);
const mockedIsClientTheLeader = jest.mocked(isClientTheLeader);
const mockedIsReady = jest.mocked(isReady);
const mockedOnReconnect = jest.mocked(NetworkConnection.onReconnect);

function renderAuthScreensInitHandler() {
    return render(
        <View>
            <AuthScreensInitHandler />
        </View>,
    );
}

describe('AuthScreensInitHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedPusherInit.mockReturnValue(Promise.resolve());
        mockedGetCurrentUrl.mockReturnValue('');
        mockedIsLoggingInAsNewUser.mockReturnValue(false);
        mockedDidUserLogInDuringSession.mockReturnValue(false);
        mockedIsClientTheLeader.mockReturnValue(true);
        mockedIsReady.mockReturnValue(Promise.resolve());
        mockedIsActiveRoute.mockReturnValue(false);
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('passes conciergeReportID to subscribeToUserEvents on mount', async () => {
        const conciergeReportID = '12345';

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, conciergeReportID);
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedPusherInit).toHaveBeenCalled();
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, conciergeReportID);
    });

    it('calls initializePusher when SIGN_IN_MODAL is active and conciergeReportID is loaded', async () => {
        mockedIsActiveRoute.mockReturnValue(true);

        const conciergeReportID = '67890';

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, conciergeReportID);
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        // subscribeToUserEvents should be called with conciergeReportID from both mount and sign-in modal effects
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, conciergeReportID);
    });

    it('does not call initializePusher from sign-in modal effect when conciergeReportID is still loading', async () => {
        mockedIsActiveRoute.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        // The mount effect calls subscribeToUserEvents with undefined conciergeReportID
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, undefined);
    });

    it('passes undefined conciergeReportID when not set', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, undefined);
    });

    it('signs out when logging in as new user during transition', async () => {
        mockedGetCurrentUrl.mockReturnValue(`https://new.expensify.com/${ROUTES.TRANSITION_BETWEEN_APPS}`);
        mockedIsLoggingInAsNewUser.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(signOutAndRedirectToSignIn).toHaveBeenCalledWith(false, false);
    });

    it('calls handleNetworkReconnect with openApp when isLoadingApp is true', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        // Get the reconnect handler that was registered
        expect(mockedOnReconnect).toHaveBeenCalled();

        const reconnectHandler = mockedOnReconnect.mock.calls.at(0)?.[0] as () => void;
        reconnectHandler();

        expect(openApp).toHaveBeenCalled();
    });

    it('calls handleNetworkReconnect with reconnectApp when isLoadingApp is false', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedOnReconnect).toHaveBeenCalled();

        const reconnectHandler = mockedOnReconnect.mock.calls.at(0)?.[0] as () => void;
        reconnectHandler();

        expect(reconnectApp).toHaveBeenCalled();
    });

    it('calls openApp when didUserLogInDuringSession returns true', async () => {
        mockedDidUserLogInDuringSession.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(openApp).toHaveBeenCalled();
    });

    it('reinitializes ActiveClientManager when not leader and transitioning', async () => {
        mockedGetCurrentUrl.mockReturnValue(`https://new.expensify.com/${ROUTES.TRANSITION_BETWEEN_APPS}`);
        mockedIsClientTheLeader.mockReturnValue(false);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(activeClientManagerInit).toHaveBeenCalled();
    });
});
