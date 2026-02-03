/**
 * Tests for the Log module, including verification that logs correctly
 * include user context when sent to the server.
 */
import MockedOnyx from 'react-native-onyx';
import HttpUtils from '@src/libs/HttpUtils';
import Log from '@src/libs/Log';
import * as Network from '@src/libs/Network';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReactNativeOnyxMock from '../../__mocks__/react-native-onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const Onyx = MockedOnyx as typeof ReactNativeOnyxMock;

// We need to NOT mock Log so we can test its actual behavior
jest.unmock('@src/libs/Log');

Onyx.init({
    keys: ONYXKEYS,
});

/**
 * Helper to process the network queue and wait for updates.
 * Log commands have shouldProcessImmediately=false, so we need to manually trigger processing.
 */
async function processNetworkQueue() {
    MainQueue.process();
    await waitForBatchedUpdates();
}

type CapturedLogData = {
    email: string | null | undefined;
    logPacket: string | undefined;
};

/**
 * Sets up a mock for HttpUtils.xhr that captures Log command data.
 * Returns an object that will be populated with captured values when the mock is called.
 */
function mockHttpUtilsXhr(): CapturedLogData {
    const captured: CapturedLogData = {
        email: undefined,
        logPacket: undefined,
    };

    HttpUtils.xhr = jest.fn().mockImplementation((command: string, data: Record<string, unknown>) => {
        if (command === 'Log') {
            captured.email = data.email as string | null | undefined;
            captured.logPacket = data.logPacket as string | undefined;
        }
        return Promise.resolve({jsonCode: 200, requestID: '123'});
    });

    return captured;
}

describe('LogTest', () => {
    const TEST_USER_EMAIL = 'test@testguy.com';
    const TEST_USER_ACCOUNT_ID = 1;
    const originalXhr = HttpUtils.xhr;

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        HttpUtils.xhr = originalXhr;
        MainQueue.clear();
        HttpUtils.cancelPendingRequests();
        NetworkStore.checkRequiredData();
        NetworkStore.setIsAuthenticating(false);
        Network.clearProcessQueueInterval();
        SequentialQueue.resetQueue();

        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        NetworkStore.resetHasReadRequiredDataFromStorage();
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test('logs include user email when sent while user is signed in', async () => {
        // Given a signed-in user
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_EMAIL);
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBe(TEST_USER_EMAIL);

        const captured = mockHttpUtilsXhr();

        // When we log a message and force it to be sent immediately
        Log.info('Test log message while signed in', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then the log request should include the user's email
        expect(captured.email).toBe(TEST_USER_EMAIL);
    });

    test('logs queued while signed in retain user email after session is cleared', async () => {
        // Given a signed-in user
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_EMAIL);
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBe(TEST_USER_EMAIL);

        // When multiple log messages are queued
        Log.info('User performed action A');
        Log.info('User performed action B');
        Log.info('User performed action C');
        Log.hmmm('Something suspicious happened');

        // And then Onyx is cleared (sign out)
        await Onyx.clear();
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBeNull();

        const captured = mockHttpUtilsXhr();

        // And then logs are flushed
        Log.info('Final trigger to flush', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then the logs should have been sent
        expect(captured.logPacket).toBeDefined();

        // And contain all the queued messages
        const logs = JSON.parse(captured.logPacket ?? '[]');
        expect(logs.length).toBeGreaterThanOrEqual(4);

        const messages = logs.map((log: {message: string}) => log.message);
        expect(messages.some((m: string) => m.includes('User performed action A'))).toBe(true);
        expect(messages.some((m: string) => m.includes('User performed action B'))).toBe(true);
        expect(messages.some((m: string) => m.includes('User performed action C'))).toBe(true);
        expect(messages.some((m: string) => m.includes('Something suspicious happened'))).toBe(true);

        // And the email should still be the original user's email
        // BUG: Currently fails because email is captured at send time
        expect(captured.email).toBe(TEST_USER_EMAIL);
    });

    test('logs during reauthentication flow retain user context', async () => {
        // This replicates the scenario from Authentication.ts where logs are
        // created during reauthentication but sent after Onyx is cleared

        // Given a signed-in user
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_EMAIL);
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBe(TEST_USER_EMAIL);

        // When a log is created (simulating Authentication.ts line 135)
        Log.info('Reauthenticate - No credentials available, redirecting to sign in');

        // And then Onyx is cleared (simulating redirectToSignIn)
        await Onyx.clear();
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBeNull();

        const captured = mockHttpUtilsXhr();

        // And then logs are flushed
        Log.info('Trigger flush', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then the log about "No credentials" should be in the packet
        const logs = JSON.parse(captured.logPacket ?? '[]');
        const hasNoCredentialsLog = logs.some((log: {message: string}) => log.message.includes('No credentials available, redirecting to sign in'));
        expect(hasNoCredentialsLog).toBe(true);

        // And the email should be the original user's email
        // BUG: Currently fails because email is captured at send time
        expect(captured.email).toBe(TEST_USER_EMAIL);
    });
});
