import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import CONFIG from '@src/CONFIG';
import PusherConnectionManager from '@src/libs/PusherConnectionManager';
import {Pusher as MockedPusher} from '../../__mocks__/@pusher/pusher-websocket-react-native/index';

/**
 * Tests for Pusher.subscribe() graceful handling when socket is disconnected
 * before the deferred subscription callback runs.
 *
 * This covers the race condition where:
 * 1. Pusher.init() is called and connects
 * 2. Pusher.subscribe() is called, which defers work via InteractionManager
 * 3. Pusher.disconnect() is called (e.g. during "Upgrade Required" teardown)
 * 4. The deferred callback finally runs and finds socket === null
 *
 * Previously, this threw an unhandled error that crashed the app in production.
 * Now it reports to Sentry via captureException without crashing.
 */

// Store the original __DEV__ value so we can restore it after tests

const originalDev = __DEV__;

async function initPusher() {
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    });

    // Flush microtasks so initPromise resolves.
    // Pusher.init() resolves via promise chains (socket.getSocketId().then → resolveInitPromise)
    // which require microtask flushing before initPromise is actually resolved.
    await jest.runAllTimersAsync();
}

describe('Pusher.subscribe', () => {
    beforeEach(() => {
        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(false);
        jest.spyOn(Pusher, 'isAlreadySubscribing').mockReturnValue(false);
    });

    afterEach(() => {
        // eslint-disable-next-line no-underscore-dangle
        (global as Record<string, unknown>).__DEV__ = originalDev;
        Pusher.disconnect();
        jest.restoreAllMocks();
    });

    it('should resolve gracefully when socket is disconnected before subscribe callback runs', async () => {
        // Simulate production environment so we hit the Sentry.captureException path
        // instead of the __DEV__ throw path
        // eslint-disable-next-line no-underscore-dangle
        (global as Record<string, unknown>).__DEV__ = false;

        // 1. Initialize Pusher and wait for initPromise to resolve
        await initPusher();

        // 2. Start subscribe — captures the already-resolved initPromise
        //    InteractionManager.runAfterInteractions callback is queued but hasn't fired yet
        const subscribePromise = Pusher.subscribe('private-user-123', 'multipleEvents');

        // 3. Disconnect BEFORE the InteractionManager callback runs (sets socket = null)
        //    This simulates the race condition during "Upgrade Required" teardown
        Pusher.disconnect();

        // 4. Flush timers and microtasks so the InteractionManager callback fires
        await jest.runAllTimersAsync();

        // 5. Subscribe should NOT throw — it should resolve gracefully
        await expect(subscribePromise).resolves.toBeUndefined();
    });

    it('should log a message when skipping subscription due to disconnected socket', async () => {
        // Simulate production environment
        // eslint-disable-next-line no-underscore-dangle
        (global as Record<string, unknown>).__DEV__ = false;

        const logSpy = jest.spyOn(Log, 'info');

        await initPusher();

        const subscribePromise = Pusher.subscribe('private-user-456', 'multipleEvents');
        Pusher.disconnect();

        await jest.runAllTimersAsync();
        await subscribePromise;

        expect(logSpy).toHaveBeenCalledWith('[Pusher] Socket disconnected before subscribe could complete, skipping subscription', false, {
            channelName: 'private-user-456',
            eventName: 'multipleEvents',
        });
    });

    it('should throw in dev when socket is disconnected before subscribe callback runs', async () => {
        // Ensure __DEV__ is true (the default in Jest)
        // eslint-disable-next-line no-underscore-dangle
        (global as Record<string, unknown>).__DEV__ = true;

        await initPusher();

        const subscribePromise = Pusher.subscribe('private-user-dev', 'multipleEvents');
        Pusher.disconnect();

        await jest.runAllTimersAsync();

        await expect(subscribePromise).rejects.toThrow('[Pusher] instance not found. Pusher.subscribe() most likely has been called before Pusher.init()');
    });

    it('should subscribe successfully when socket is connected', async () => {
        await initPusher();

        const subscribePromise = Pusher.subscribe('private-user-789', 'multipleEvents');

        // Flush so InteractionManager callback fires and subscription completes
        await jest.runAllTimersAsync();

        await expect(subscribePromise).resolves.toBeUndefined();
    });
});

describe('Per-callback subscription handles', () => {
    const CHANNEL = 'private-user-callback';
    const EVENT = 'testEvent';

    beforeEach(async () => {
        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(false);
        jest.spyOn(Pusher, 'isAlreadySubscribing').mockReturnValue(false);
        await initPusher();
    });

    afterEach(() => {
        Pusher.disconnect();
        jest.restoreAllMocks();
    });

    function triggerEvent(channelName: string, eventName: string, data: Record<string, unknown> = {value: 1}) {
        // Fire events through the mock socket's trigger, which invokes the Pusher module's
        // onEvent dispatcher that iterates over eventsBoundToChannels.
        MockedPusher.getInstance().trigger({channelName, eventName, data});
    }

    it('should return a PusherSubscription with an unsubscribe method', async () => {
        const handle = Pusher.subscribe(CHANNEL, EVENT, () => {});
        await jest.runAllTimersAsync();
        await handle;

        expect(typeof handle.unsubscribe).toBe('function');
    });

    it('should deliver events to both subscribers on the same channel+event', async () => {
        const callbackA = jest.fn();
        const callbackB = jest.fn();

        const handleA = Pusher.subscribe(CHANNEL, EVENT, callbackA);
        await jest.runAllTimersAsync();
        await handleA;

        // Second subscribe to same channel — goes through the "already subscribed" branch
        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(true);
        const handleB = Pusher.subscribe(CHANNEL, EVENT, callbackB);
        await jest.runAllTimersAsync();
        await handleB;

        triggerEvent(CHANNEL, EVENT, {msg: 'hello'});

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(callbackA).toHaveBeenCalledWith({msg: 'hello'});

        handleA.unsubscribe();
        handleB.unsubscribe();
    });

    it('should stop delivering events to an unsubscribed callback while others continue', async () => {
        const callbackA = jest.fn();
        const callbackB = jest.fn();

        const handleA = Pusher.subscribe(CHANNEL, EVENT, callbackA);
        await jest.runAllTimersAsync();
        await handleA;

        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(true);
        const handleB = Pusher.subscribe(CHANNEL, EVENT, callbackB);
        await jest.runAllTimersAsync();
        await handleB;

        // Unsubscribe A only
        handleA.unsubscribe();

        triggerEvent(CHANNEL, EVENT, {msg: 'after-removal'});

        expect(callbackA).not.toHaveBeenCalled();
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledWith({msg: 'after-removal'});

        handleB.unsubscribe();
    });

    it('should keep the channel subscribed until the last callback unsubscribes', async () => {
        const handleA = Pusher.subscribe(CHANNEL, EVENT, jest.fn());
        await jest.runAllTimersAsync();
        await handleA;

        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(true);
        const handleB = Pusher.subscribe(CHANNEL, EVENT, jest.fn());
        await jest.runAllTimersAsync();
        await handleB;

        // After unsubscribing A, mock socket should still have the channel
        handleA.unsubscribe();
        expect(MockedPusher.getInstance().getChannel(CHANNEL)).toBeTruthy();

        // After unsubscribing B (last callback), channel should be cleaned up
        handleB.unsubscribe();
        expect(MockedPusher.getInstance().getChannel(CHANNEL)).toBeFalsy();
    });

    it('should handle unsubscribe before subscription completes without errors', async () => {
        const callback = jest.fn();

        // Subscribe but do NOT flush timers yet — subscription is pending
        const handle = Pusher.subscribe(CHANNEL, EVENT, callback);

        // Unsubscribe immediately (sets disposed = true)
        handle.unsubscribe();

        // Now flush — the InteractionManager callback should see disposed=true and skip binding
        await jest.runAllTimersAsync();
        await expect(handle).resolves.toBeUndefined();

        // Event should not reach the callback since it was never bound
        triggerEvent(CHANNEL, EVENT);
        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple events on the same channel with independent cleanup', async () => {
        const callbackX = jest.fn();
        const callbackY = jest.fn();

        const handleX = Pusher.subscribe(CHANNEL, 'eventX', callbackX);
        await jest.runAllTimersAsync();
        await handleX;

        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(true);
        const handleY = Pusher.subscribe(CHANNEL, 'eventY', callbackY);
        await jest.runAllTimersAsync();
        await handleY;

        // Both events should work
        triggerEvent(CHANNEL, 'eventX', {type: 'x'});
        triggerEvent(CHANNEL, 'eventY', {type: 'y'});
        expect(callbackX).toHaveBeenCalledWith({type: 'x'});
        expect(callbackY).toHaveBeenCalledWith({type: 'y'});

        // Unsubscribe eventX — eventY should still work
        handleX.unsubscribe();
        callbackX.mockClear();
        callbackY.mockClear();

        triggerEvent(CHANNEL, 'eventX', {type: 'x2'});
        triggerEvent(CHANNEL, 'eventY', {type: 'y2'});
        expect(callbackX).not.toHaveBeenCalled();
        expect(callbackY).toHaveBeenCalledWith({type: 'y2'});

        // Unsubscribe eventY — channel should be fully cleaned up
        handleY.unsubscribe();
        expect(MockedPusher.getInstance().getChannel(CHANNEL)).toBeFalsy();
    });

    it('should clear all callbacks on disconnect so they do not fire after re-init', async () => {
        const oldCallback = jest.fn();

        const handle = Pusher.subscribe(CHANNEL, EVENT, oldCallback);
        await jest.runAllTimersAsync();
        await handle;

        // Disconnect clears all callback tracking
        Pusher.disconnect();
        jest.restoreAllMocks();

        // Re-init and subscribe a new callback
        jest.spyOn(Pusher, 'isSubscribed').mockReturnValue(false);
        jest.spyOn(Pusher, 'isAlreadySubscribing').mockReturnValue(false);
        await initPusher();

        const newCallback = jest.fn();
        const newHandle = Pusher.subscribe(CHANNEL, EVENT, newCallback);
        await jest.runAllTimersAsync();
        await newHandle;

        // Fire event — only new callback should receive it
        triggerEvent(CHANNEL, EVENT, {session: 'new'});
        expect(oldCallback).not.toHaveBeenCalled();
        expect(newCallback).toHaveBeenCalledWith({session: 'new'});

        newHandle.unsubscribe();
    });

    it('should clean up channel when disposed mid-handshake before onSubscriptionSucceeded', async () => {
        // Capture the onSubscriptionSucceeded callback so we can fire it manually
        const mockSocket = MockedPusher.getInstance();
        let capturedOnSuccess: (() => void) | undefined;

        jest.spyOn(mockSocket, 'subscribe').mockImplementation(({channelName: cn, onEvent, onSubscriptionSucceeded}) => {
            // Store the channel like the real mock, but DON'T call onSubscriptionSucceeded yet
            mockSocket.channels.set(cn, {onEvent, onSubscriptionSucceeded});
            capturedOnSuccess = onSubscriptionSucceeded;
            return Promise.resolve();
        });

        const callback = jest.fn();
        const handle = Pusher.subscribe(CHANNEL, EVENT, callback);

        // Flush InteractionManager — socket.subscribe() fires, but onSubscriptionSucceeded is deferred
        await jest.runAllTimersAsync();
        expect(capturedOnSuccess).toBeDefined();

        // Dispose the handle mid-handshake (wrappedCb is still undefined)
        handle.unsubscribe();

        // Now fire onSubscriptionSucceeded — the disposed handle should trigger channel cleanup
        capturedOnSuccess?.();
        await jest.runAllTimersAsync();
        await handle;

        // Channel should be cleaned up since no callbacks are bound
        expect(mockSocket.channels.has(CHANNEL)).toBe(false);

        // Event should not reach the callback
        triggerEvent(CHANNEL, EVENT);
        expect(callback).not.toHaveBeenCalled();
    });
});
