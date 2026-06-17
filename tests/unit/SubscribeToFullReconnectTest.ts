import Onyx from 'react-native-onyx';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import clearOnyxAndSeedFullReconnect from '@libs/actions/clearOnyxAndSeedFullReconnect';
import {writeWithNoDuplicatesConflictAction} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import '@libs/subscribeToFullReconnect';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/Log');

const mockWriteCommand = jest.mocked(writeWithNoDuplicatesConflictAction);

// The case under test: this device's clock is behind the server, so the server cutoff is ahead of "now".
const CLIENT_NOW = '2026-06-12 10:00:00.000';
const SERVER_CUTOFF = '2026-06-12 10:05:00.000';
const NEWER_SERVER_CUTOFF = '2026-06-12 10:10:00.000';

// Ordered log of two things: when we record the completion time (via the Onyx subscription below) and
// when a reconnect request is sent (via the API mock). Lets tests assert we record before we request.
let events: Array<{type: 'completion' | 'request'; value: string}> = [];
let capturedOnyxData: Array<NonNullable<Parameters<typeof writeWithNoDuplicatesConflictAction>[2]>> = [];
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        events.push({type: 'completion', value: value ?? ''});
    },
});

function getReconnectRequests() {
    return mockWriteCommand.mock.calls.filter(([command]) => command === WRITE_COMMANDS.RECONNECT_APP);
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

async function setServerCutoff(cutoff: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, cutoff);
    await waitForCondition(() => getReconnectRequests().length > 0, 'first ReconnectApp request');
}

describe('subscribeToFullReconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        confirmReadyToOpenApp();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        events = [];
        capturedOnyxData = [];
        jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
        mockWriteCommand.mockImplementation((command, params, onyxData) => {
            events.push({type: 'request', value: String(command)});
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
        expect(mockWriteCommand.mock.calls).toHaveLength(1);
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

    it('does not fire a redundant reconnect through clearOnyxAndSeedFullReconnect and records client-now when there is no cutoff', async () => {
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(mockWriteCommand).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(CLIENT_NOW);
    });
});
