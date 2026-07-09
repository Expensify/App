import {openApp} from '@libs/actions/App';
import clearOnyxAndSeedFullReconnect from '@libs/actions/clearOnyxAndSeedFullReconnect';
import {flushQueue, queueOnyxUpdates} from '@libs/actions/QueuedOnyxUpdates';
import {writeWithNoDuplicatesConflictAction, writeWithNoDuplicatesReconnectConflictAction} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {recordFullReconnectTimeFromResponse} from '@libs/FullReconnectUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import '@libs/subscribeToFullReconnect';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/Log');

// reconnectApp() goes through the reconnect wrapper; openApp() goes through the generic one. Both are
// recorded into capturedCommands/capturedOnyxData in call order so the index-based helpers below work.
const mockReconnectWriteCommand = jest.mocked(writeWithNoDuplicatesReconnectConflictAction);
const mockOpenAppWriteCommand = jest.mocked(writeWithNoDuplicatesConflictAction);

// The case under test: this device's clock is behind the server, so the server cutoff is ahead of "now".
const CLIENT_NOW = '2026-06-12 10:00:00.000';
const SERVER_CUTOFF = '2026-06-12 10:05:00.000';
const NEWER_SERVER_CUTOFF = '2026-06-12 10:10:00.000';

// Ordered log of two things: when we record the completion time (via the Onyx subscription below) and
// when a reconnect request is sent (via the API mock). Lets tests assert we record before we request.
let events: Array<{type: 'completion' | 'request'; value: string}> = [];
let capturedOnyxData: Array<NonNullable<Parameters<typeof writeWithNoDuplicatesReconnectConflictAction>[2]>> = [];
let capturedCommands: string[] = [];
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        events.push({type: 'completion', value: value ?? ''});
    },
});

function getReconnectRequests() {
    return capturedCommands.filter((command) => command === WRITE_COMMANDS.RECONNECT_APP);
}

async function waitForCondition(predicate: () => boolean, label: string): Promise<void> {
    for (let i = 0; i < 50; i++) {
        if (predicate()) {
            return;
        }
        await waitForBatchedUpdates();
    }
    throw new Error(`Timed out waiting for: ${label}`);
}

/**
 * Simulates a server response the way applyHTTPSOnyxUpdates does: it applies onyxData (which re-delivers
 * the cutoff) before successData (which records the completion time), then drains pending work so any
 * unwanted re-trigger shows up before we assert.
 */
async function applyServerResponse(redeliveredCutoff: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, redeliveredCutoff);
    await waitForBatchedUpdates();
    await Onyx.update(capturedOnyxData.at(0)?.successData ?? []);
    await waitForBatchedUpdates();
    await waitForBatchedUpdates();
}

function getOpenAppRequestIndex() {
    return capturedCommands.findIndex((command) => command === WRITE_COMMANDS.OPEN_APP);
}

/**
 * Same response shape as applyServerResponse, but for an arbitrary captured request (OpenApp as well as
 * ReconnectApp): applies the re-delivered cutoff (onyxData) before that request's successData.
 */
async function applyCapturedResponse(callIndex: number, redeliveredCutoff: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, redeliveredCutoff);
    await waitForBatchedUpdates();
    await Onyx.update(capturedOnyxData.at(callIndex)?.successData ?? []);
    await waitForBatchedUpdates();
    await waitForBatchedUpdates();
}

/**
 * Applies a captured request's response the way the side-effect ReconnectApp path does since the
 * RecordFullReconnectTime middleware: the response's onyxData is first passed through
 * recordFullReconnectTimeFromResponse, then applied, then the (also updated) successData as a
 * second, separate Onyx.update.
 */
async function applyCapturedResponseThroughMiddleware(callIndex: number, deliveredCutoff: string): Promise<void> {
    const successData = capturedOnyxData.at(callIndex)?.successData ?? [];
    const responseOnyxData: AnyOnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, value: deliveredCutoff}];
    recordFullReconnectTimeFromResponse(responseOnyxData, successData);
    await Onyx.update(responseOnyxData);
    await waitForBatchedUpdates();
    await Onyx.update(successData);
    await waitForBatchedUpdates();
    await waitForBatchedUpdates();
}

/**
 * Same middleware transform, but applied the way WRITE requests (OpenApp, the normal ReconnectApp)
 * land in production: onyxData and successData go through QueuedOnyxUpdates and flush as one combined
 * Onyx.update, where per-key batching must keep the seeded reconnect time ahead of the cutoff.
 */
async function applyCapturedResponseThroughWriteQueue(callIndex: number, deliveredCutoff: string): Promise<void> {
    const successData = capturedOnyxData.at(callIndex)?.successData ?? [];
    const responseOnyxData: AnyOnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, value: deliveredCutoff}];
    recordFullReconnectTimeFromResponse(responseOnyxData, successData);
    await queueOnyxUpdates(responseOnyxData);
    await queueOnyxUpdates(successData);
    await flushQueue();
    await waitForBatchedUpdates();
    await waitForBatchedUpdates();
}

async function setServerCutoff(cutoff: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, cutoff);
    await waitForCondition(() => getReconnectRequests().length > 0, 'first ReconnectApp request');
}

describe('subscribeToFullReconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        events = [];
        capturedOnyxData = [];
        capturedCommands = [];
        jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
        mockReconnectWriteCommand.mockImplementation((command, params, onyxData) => {
            events.push({type: 'request', value: String(command)});
            capturedCommands.push(String(command));
            capturedOnyxData.push(onyxData ?? {});
            return Promise.resolve();
        });
        mockOpenAppWriteCommand.mockImplementation((command, params, onyxData) => {
            events.push({type: 'request', value: String(command)});
            capturedCommands.push(String(command));
            capturedOnyxData.push(onyxData ?? {});
            return Promise.resolve();
        });
        // reconnectApp falls back to openApp until the app has loaded once
        await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, true);
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('fires exactly one ReconnectApp across a full response cycle on a client clock behind the server', async () => {
        await setServerCutoff(SERVER_CUTOFF);

        await applyServerResponse(SERVER_CUTOFF);

        expect(getReconnectRequests()).toHaveLength(1);
        expect(capturedCommands).toHaveLength(1);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(SERVER_CUTOFF);
    });

    it('records the completion time as max(now, cutoff) before the reconnect request is sent', async () => {
        await setServerCutoff(SERVER_CUTOFF);

        const firstRequestIndex = events.findIndex((event) => event.type === 'request');
        const completionIndex = events.findIndex((event) => event.type === 'completion' && event.value === SERVER_CUTOFF);

        expect(firstRequestIndex).toBeGreaterThan(-1);
        expect(completionIndex).toBeGreaterThan(-1);
        expect(completionIndex).toBeLessThan(firstRequestIndex);
    });

    it('still fires a fresh reconnect when a genuinely newer cutoff arrives after a completed cycle', async () => {
        await setServerCutoff(SERVER_CUTOFF);
        await applyServerResponse(SERVER_CUTOFF);
        expect(getReconnectRequests()).toHaveLength(1);

        await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, NEWER_SERVER_CUTOFF);
        await waitForCondition(() => getReconnectRequests().length > 1, 'reconnect for the newer server cutoff');

        expect(getReconnectRequests()).toHaveLength(2);
    });

    it('records max(now, cutoff) in OpenApp successData when the cutoff is already known and the client clock is behind', async () => {
        // The OpenApp leg shares getOnyxDataForOpenOrReconnect with ReconnectApp. With the cutoff already
        // known at request-build time and the clock behind, the recorded time must be held to the cutoff.
        await setServerCutoff(SERVER_CUTOFF);
        jest.clearAllMocks();
        capturedOnyxData = [];
        capturedCommands = [];

        openApp();
        await waitForCondition(() => getOpenAppRequestIndex() > -1, 'OpenApp request');

        const recorded = capturedOnyxData.at(getOpenAppRequestIndex())?.successData?.find((entry) => entry.key === ONYXKEYS.LAST_FULL_RECONNECT_TIME);
        // Pre-fix this recorded DateUtils.getDBTime() (CLIENT_NOW), which is before the cutoff.
        expect(recorded?.value).toBe(SERVER_CUTOFF);
    });

    it('does not start a reconnect loop when an OpenApp response re-delivers an already-known cutoff on a client clock behind the server', async () => {
        // Reach the settled state first: one reconnect for the cutoff, then its response recorded the time.
        await setServerCutoff(SERVER_CUTOFF);
        await applyServerResponse(SERVER_CUTOFF);
        jest.clearAllMocks();
        capturedOnyxData = [];
        capturedCommands = [];

        // App reload: OpenApp fires with the cutoff already known, and its response re-delivers that cutoff.
        openApp();
        await waitForCondition(() => getOpenAppRequestIndex() > -1, 'OpenApp request');
        await applyCapturedResponse(getOpenAppRequestIndex(), SERVER_CUTOFF);

        // The OpenApp response recorded the cutoff, not the behind-clock now, so nothing reads as stale.
        expect(getReconnectRequests()).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(SERVER_CUTOFF);
    });

    it('does not fire an extra reconnect when an OpenApp response delivers a newer cutoff than was known at build time', async () => {
        // Reach the settled state first: one reconnect for the cutoff, then its response recorded the time.
        await setServerCutoff(SERVER_CUTOFF);
        await applyServerResponse(SERVER_CUTOFF);
        jest.clearAllMocks();
        capturedOnyxData = [];
        capturedCommands = [];

        // App reload: OpenApp fires while SERVER_CUTOFF is the known cutoff, but the response delivers a
        // newer one. Without the middleware transform this fires two extra reconnects: one the moment the
        // new cutoff is saved next to the old recorded time, and one more when the stale build-time
        // successData lowers the recorded time below the cutoff again.
        openApp();
        await waitForCondition(() => getOpenAppRequestIndex() > -1, 'OpenApp request');
        await applyCapturedResponseThroughMiddleware(getOpenAppRequestIndex(), NEWER_SERVER_CUTOFF);

        expect(getReconnectRequests()).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(NEWER_SERVER_CUTOFF);
    });

    it('does not fire an extra reconnect when the newer-cutoff OpenApp response lands as one write-queue batch', async () => {
        // Reach the settled state first: one reconnect for the cutoff, then its response recorded the time.
        await setServerCutoff(SERVER_CUTOFF);
        await applyServerResponse(SERVER_CUTOFF);
        jest.clearAllMocks();
        capturedOnyxData = [];
        capturedCommands = [];

        // Same scenario as above, but applied the way OpenApp actually lands in production: onyxData and
        // successData flush together in one Onyx.update batch.
        openApp();
        await waitForCondition(() => getOpenAppRequestIndex() > -1, 'OpenApp request');
        await applyCapturedResponseThroughWriteQueue(getOpenAppRequestIndex(), NEWER_SERVER_CUTOFF);

        expect(getReconnectRequests()).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(NEWER_SERVER_CUTOFF);
    });

    it('does not fire a redundant reconnect through clearOnyxAndSeedFullReconnect and records client-now when there is no cutoff', async () => {
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(capturedCommands).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(CLIENT_NOW);
    });
});
