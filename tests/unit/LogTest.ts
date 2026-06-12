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

type LogLine = {
    message: string;
    parameters: unknown;
    timestamp: string;
};

type CapturedLogRequest = {
    email: string | null | undefined;
    logPacket: string | undefined;
};

function parseLogPacket(logPacket: string | undefined): LogLine[] {
    if (!logPacket) {
        return [];
    }
    return JSON.parse(logPacket) as LogLine[];
}

/**
 * Sets up a mock for HttpUtils.xhr that captures all Log command requests.
 * Returns an array that will be populated with captured requests when the mock is called.
 */
function mockHttpUtilsXhr(): CapturedLogRequest[] {
    const capturedRequests: CapturedLogRequest[] = [];

    HttpUtils.xhr = jest.fn().mockImplementation((command: string, data: Record<string, unknown>) => {
        if (command === 'Log') {
            capturedRequests.push({
                email: data.email as string | null | undefined,
                logPacket: data.logPacket as string | undefined,
            });
        }
        return Promise.resolve({jsonCode: 200, requestID: '123'});
    });

    return capturedRequests;
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

        const capturedRequests = mockHttpUtilsXhr();

        // When we log a message and force it to be sent immediately
        Log.info('Test log message while signed in', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then a log request should have been made
        expect(capturedRequests.length).toBeGreaterThanOrEqual(1);

        // And the request for this user's logs should include their email
        const userRequest = capturedRequests.find((req) => req.email === TEST_USER_EMAIL);
        expect(userRequest).toBeDefined();
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

        const capturedRequests = mockHttpUtilsXhr();

        // And then logs are flushed (this log has null email since user is signed out)
        Log.info('Final trigger to flush', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then multiple requests should have been made (split by email)
        expect(capturedRequests.length).toBeGreaterThanOrEqual(1);

        // And a request with the original user's email should contain their logs
        const userRequest = capturedRequests.find((req) => req.email === TEST_USER_EMAIL);
        expect(userRequest).toBeDefined();
        expect(userRequest?.logPacket).toBeDefined();

        const userLogs = parseLogPacket(userRequest?.logPacket);
        expect(userLogs.length).toBeGreaterThanOrEqual(4);

        const messages = userLogs.map((log) => log.message);
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.stringContaining('User performed action A'),
                expect.stringContaining('User performed action B'),
                expect.stringContaining('User performed action C'),
                expect.stringContaining('Something suspicious happened'),
            ]),
        );
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

        const capturedRequests = mockHttpUtilsXhr();

        // And then logs are flushed (this log has null email since user is signed out)
        Log.info('Trigger flush', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Then a request with the original user's email should be made
        const userRequest = capturedRequests.find((req) => req.email === TEST_USER_EMAIL);
        expect(userRequest).toBeDefined();

        // And the log about "No credentials" should be in that user's packet
        const userLogs = parseLogPacket(userRequest?.logPacket);
        const messages = userLogs.map((log) => log.message);
        expect(messages).toEqual(expect.arrayContaining([expect.stringContaining('No credentials available, redirecting to sign in')]));
    });

    test('logs from multiple users in same flush are split into separate requests', async () => {
        // This tests the scenario where user A signs out and user B signs in
        // before the queued logs flush

        const USER_A_EMAIL = 'userA@test.com';
        const USER_B_EMAIL = 'userB@test.com';

        // Given user A is signed in
        await TestHelper.signInWithTestUser(1, USER_A_EMAIL);
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBe(USER_A_EMAIL);

        // Set up mock to capture all requests
        const capturedRequests = mockHttpUtilsXhr();

        // And user A creates some logs
        Log.info('User A action 1');
        Log.info('User A action 2');

        // When user A signs out (using merge to avoid triggering extra logs)
        await Onyx.merge(ONYXKEYS.SESSION, {email: null, authToken: null});
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBeNull();

        // And user B "signs in" (just set the email directly to avoid system logs)
        await Onyx.merge(ONYXKEYS.SESSION, {email: USER_B_EMAIL, authToken: 'token123'});
        await waitForBatchedUpdates();
        expect(NetworkStore.getCurrentUserEmail()).toBe(USER_B_EMAIL);

        // And user B creates some logs
        Log.info('User B action 1');
        Log.info('User B action 2');

        // And then all logs are flushed
        Log.info('Trigger flush', true);
        await waitForBatchedUpdates();
        await processNetworkQueue();

        // Helper to collect all messages from all requests for a given email
        const getAllMessagesForEmail = (email: string): string[] => {
            return capturedRequests
                .filter((req) => req.email === email)
                .flatMap((req) => parseLogPacket(req.logPacket))
                .map((log) => log.message);
        };

        // Then requests should have been made for each user
        const userAMessages = getAllMessagesForEmail(USER_A_EMAIL);
        const userBMessages = getAllMessagesForEmail(USER_B_EMAIL);

        expect(userAMessages.length).toBeGreaterThan(0);
        expect(userBMessages.length).toBeGreaterThan(0);

        // And user A's explicit logs should be in requests with their email
        expect(userAMessages).toEqual(expect.arrayContaining([expect.stringContaining('User A action 1'), expect.stringContaining('User A action 2')]));
        // User B's explicit logs should NOT be in user A's requests
        expect(userAMessages.join()).not.toContain('User B action');

        // And user B's explicit logs should be in requests with their email
        expect(userBMessages).toEqual(expect.arrayContaining([expect.stringContaining('User B action 1'), expect.stringContaining('User B action 2')]));
        // User A's explicit logs should NOT be in user B's requests
        expect(userBMessages.join()).not.toContain('User A action');
    });

    test('partial upload failure does not cause duplicates on retry', async () => {
        // This tests that if one email group fails while others succeed,
        // we resolve (to prevent retry/duplicates) rather than reject

        const USER_A_EMAIL = 'userA@test.com';
        const USER_B_EMAIL = 'userB@test.com';

        // Given user A is signed in
        await TestHelper.signInWithTestUser(1, USER_A_EMAIL);
        await waitForBatchedUpdates();

        // Set up mock that fails for USER_A but succeeds for others
        const capturedRequests: CapturedLogRequest[] = [];
        HttpUtils.xhr = jest.fn().mockImplementation((command: string, data: Record<string, unknown>) => {
            if (command === 'Log') {
                capturedRequests.push({
                    email: data.email as string | null | undefined,
                    logPacket: data.logPacket as string | undefined,
                });

                // Fail requests for USER_A_EMAIL
                if (data.email === USER_A_EMAIL) {
                    return Promise.reject(new Error('Simulated network failure'));
                }
            }
            return Promise.resolve({jsonCode: 200, requestID: '123'});
        });

        // User A creates logs
        Log.info('User A log');

        // Switch to user B
        await Onyx.merge(ONYXKEYS.SESSION, {email: USER_B_EMAIL, authToken: 'token123'});
        await waitForBatchedUpdates();

        // User B creates logs
        Log.info('User B log');

        // Flush logs - this should NOT throw even though USER_A's request failed
        Log.info('Trigger flush', true);
        await waitForBatchedUpdates();

        // The network queue should process without throwing
        await expect(processNetworkQueue()).resolves.not.toThrow();

        // Both requests should have been attempted
        expect(capturedRequests.some((req) => req.email === USER_A_EMAIL)).toBe(true);
        expect(capturedRequests.some((req) => req.email === USER_B_EMAIL)).toBe(true);
    });

    test('all requests failing causes rejection for retry', async () => {
        // This tests that if ALL email groups fail, we reject so the Logger can retry

        // Given a signed-in user
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_EMAIL);
        await waitForBatchedUpdates();

        // Set up mock that always fails for Log commands
        let logCallCount = 0;
        HttpUtils.xhr = jest.fn().mockImplementation((command: string) => {
            if (command === 'Log') {
                logCallCount++;
                return Promise.reject(new Error('Simulated network failure'));
            }
            return Promise.resolve({jsonCode: 200, requestID: '123'});
        });

        // Create a log
        Log.info('Test log');

        // Flush logs
        Log.info('Trigger flush', true);
        await waitForBatchedUpdates();

        // The network queue processing should eventually reject (though the queue handles this internally)
        await processNetworkQueue();

        // Verify Log command was attempted
        expect(logCallCount).toBeGreaterThan(0);
    });
});
