import {render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import {init as activeClientManagerInit, isClientTheLeader, isReady} from '@libs/ActiveClientManager';
import {isQAServerActive} from '@libs/ApiUtils';
import AuthScreensInitHandler from '@libs/Navigation/AppNavigator/AuthScreensInitHandler';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import {didUserLogInDuringSession, isLoggingInAsNewUser} from '@libs/SessionUtils';

import {openApp} from '@userActions/App';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import {subscribeToUserEvents} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const TEST_ACCOUNT_ID = 1;
const QA_APP_KEY = 'qa-app-key';

jest.mock('@libs/ApiUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ApiUtils'),
    isQAServerActive: jest.fn(() => false),
}));

jest.mock('@libs/Pusher', () => ({
    __esModule: true,
    default: {
        init: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/PusherConnectionManager', () => ({
    __esModule: true,
    default: {
        init: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        isActiveRoute: jest.fn(() => false),
        navigate: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        getFocusedReportId: jest.fn(() => undefined),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        setNavigationActionToMicrotaskQueue: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/Navigation/currentUrl', () => ({
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
const mockedSubscribeToUserEvents = jest.mocked(subscribeToUserEvents);
const mockedIsQAServerActive = jest.mocked(isQAServerActive);
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
        mockedIsQAServerActive.mockReturnValue(false);
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('calls subscribeToUserEvents with a getter function on mount', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedPusherInit).toHaveBeenCalled();
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, 'test@test.com', expect.any(Function), expect.any(Function));
    });

    it('calls subscribeToUserEvents from sign-in modal effect when SIGN_IN_MODAL is active', async () => {
        mockedIsActiveRoute.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        // Both mount effect AND sign-in modal effect fire → 2 calls
        expect(subscribeToUserEvents).toHaveBeenCalledTimes(2);
        expect(subscribeToUserEvents).toHaveBeenCalledWith(TEST_ACCOUNT_ID, 'test@test.com', expect.any(Function), expect.any(Function));
    });

    it('getter passed to subscribeToUserEvents returns report attributes when available', async () => {
        const mockReports = createMock<ReportAttributesDerivedValue['reports']>({testReport: {reportName: 'Test Report'}});

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {reports: mockReports});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        const firstCallArgs = mockedSubscribeToUserEvents.mock.calls.at(0);
        if (!firstCallArgs) {
            throw new Error('Expected subscribeToUserEvents to be called');
        }
        const getter = firstCallArgs[3];
        if (!getter) {
            throw new Error('Expected report attributes getter to be provided');
        }
        expect(getter()).toEqual(mockReports);
    });

    it('getter passed to subscribeToUserEvents returns undefined when report attributes not yet loaded', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        // Intentionally do not set ONYXKEYS.DERIVED.REPORT_ATTRIBUTES
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        const firstCallArgs = mockedSubscribeToUserEvents.mock.calls.at(0);
        if (!firstCallArgs) {
            throw new Error('Expected subscribeToUserEvents to be called');
        }
        const getter = firstCallArgs[3];
        if (!getter) {
            throw new Error('Expected report attributes getter to be provided');
        }
        expect(getter()).toBeUndefined();
    });

    it.each([
        ['production', false, CONFIG.PUSHER.APP_KEY],
        ['QA', true, QA_APP_KEY],
    ])('opens the Pusher socket with the %s app key', async (_server, isQAActive, expectedAppKey) => {
        // PUSHER_QA_APP_KEY is empty in this environment, so give it a value the QA case can pick up.
        jest.replaceProperty(CONFIG.PUSHER, 'QA_APP_KEY', QA_APP_KEY);
        mockedIsQAServerActive.mockReturnValue(isQAActive);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedPusherInit).toHaveBeenCalledWith({appKey: expectedAppKey, cluster: CONFIG.PUSHER.CLUSTER});
    });

    it('skips Pusher init when the active server has no app key configured', async () => {
        mockedIsQAServerActive.mockReturnValue(true);
        jest.replaceProperty(CONFIG.PUSHER, 'QA_APP_KEY', '');

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID, email: 'test@test.com'});
        await waitForBatchedUpdates();

        renderAuthScreensInitHandler();
        await waitForBatchedUpdatesWithAct();

        expect(mockedPusherInit).not.toHaveBeenCalled();
        expect(mockedSubscribeToUserEvents).not.toHaveBeenCalled();
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
