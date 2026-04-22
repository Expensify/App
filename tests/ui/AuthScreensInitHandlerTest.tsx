import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {init as activeClientManagerInit, isClientTheLeader, isReady} from '@libs/ActiveClientManager';
import AuthScreensInitHandler from '@libs/Navigation/AppNavigator/AuthScreensInitHandler';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import {didUserLogInDuringSession, isLoggingInAsNewUser} from '@libs/SessionUtils';
import {openApp} from '@userActions/App';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import {subscribeToUserEvents} from '@userActions/User';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
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
    setLocale: jest.fn(),
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
function renderAuthScreensInitHandler() {
    return render(
        <LocaleContextProvider>
            <View>
                <AuthScreensInitHandler />
            </View>
        </LocaleContextProvider>,
    );
}

describe('AuthScreensInitHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
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

    it('calls subscribeToUserEvents with a getter function on mount', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedPusherInit).toHaveBeenCalled();
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, expect.any(Function));
    });

    it('calls subscribeToUserEvents from sign-in modal effect when SIGN_IN_MODAL is active', async () => {
        mockedIsActiveRoute.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        // Both mount effect AND sign-in modal effect fire → 2 calls
        expect(subscribeToUserEvents).toHaveBeenCalledTimes(2);
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, expect.any(Function));
    });

    it('getter passed to subscribeToUserEvents returns report attributes when available', async () => {
        const mockReports = {testReport: {reportName: 'Test Report'}} as unknown as ReportAttributesDerivedValue['reports'];

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {reports: mockReports});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        const mockCalls = (subscribeToUserEvents as jest.Mock).mock.calls;
        const firstCallArgs = mockCalls.at(0) as unknown[];
        const getter = firstCallArgs.at(1) as () => unknown;
        expect(getter()).toEqual(mockReports);
    });

    it('getter passed to subscribeToUserEvents returns undefined when report attributes not yet loaded', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        // Intentionally do not set ONYXKEYS.DERIVED.REPORT_ATTRIBUTES
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        const mockCalls = (subscribeToUserEvents as jest.Mock).mock.calls;
        const firstCallArgs = mockCalls.at(0) as unknown[];
        const getter = firstCallArgs.at(1) as () => unknown;
        expect(getter()).toBeUndefined();
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
