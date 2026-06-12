import Onyx from 'react-native-onyx';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import clearOnyxAndSeedFullReconnect from '@libs/actions/clearOnyxAndSeedFullReconnect';
import {writeWithNoDuplicatesConflictAction} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import '@libs/subscribeToFullReconnect';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/Log');

const mockWriteCommand = jest.mocked(writeWithNoDuplicatesConflictAction);

// The skew regime that sustains production storms: the server's NVP demand is ahead of the
// client clock, so a plain client-now receipt would always compare below it.
const CLIENT_NOW = '2026-06-12 10:00:00.000';
const SERVER_DEMAND = '2026-06-12 10:05:00.000';
const NEWER_SERVER_DEMAND = '2026-06-12 10:10:00.000';

// Ordered observation log: receipt writes (via the Onyx subscription below) and reconnect
// requests (via the API mock), so tests can assert seed-before-request ordering.
let events: Array<{type: 'receipt' | 'request'; value: string}> = [];
let capturedOnyxData: Array<NonNullable<Parameters<typeof writeWithNoDuplicatesConflictAction>[2]>> = [];
let latestReceipt = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        latestReceipt = value ?? '';
        events.push({type: 'receipt', value: value ?? ''});
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
 * Simulates the server answering a captured ReconnectApp request the way applyHTTPSOnyxUpdates
 * does: response.onyxData (which re-delivers the NVP) is applied before successData (which
 * writes the LAST_FULL_RECONNECT_TIME receipt).
 */
async function applyServerResponse(callIndex: number, redeliveredNVP: string): Promise<void> {
    const onyxData = capturedOnyxData.at(callIndex);
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, redeliveredNVP);
    await waitForBatchedUpdates();
    await Onyx.update(onyxData?.successData ?? []);
    await waitForBatchedUpdates();
}

async function triggerFullReconnectDemand(nvp: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, nvp);
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

    it('fires exactly one ReconnectApp across a full response cycle on a client clock behind the server (headline regression)', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);

        await applyServerResponse(0, SERVER_DEMAND);

        // Drain any would-be re-arm: on pre-fix code the successData receipt (client-now, below
        // the NVP) re-triggers the subscription here and a second request appears.
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(getReconnectRequests()).toHaveLength(1);
        expect(mockWriteCommand.mock.calls).toHaveLength(1);
    });

    it('writes the receipt to max(now, NVP) before the reconnect request is created', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);

        const firstRequestIndex = events.findIndex((event) => event.type === 'request');
        const seedIndex = events.findIndex((event) => event.type === 'receipt' && event.value === SERVER_DEMAND);

        expect(firstRequestIndex).toBeGreaterThan(-1);
        expect(seedIndex).toBeGreaterThan(-1);
        expect(seedIndex).toBeLessThan(firstRequestIndex);
    });

    it('keeps the stored receipt at or above the answered NVP after the response cycle (receipt floor)', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);

        await applyServerResponse(0, SERVER_DEMAND);

        expect(latestReceipt >= SERVER_DEMAND).toBe(true);
    });

    it('still fires a fresh reconnect when a genuinely newer NVP arrives after a completed cycle', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);
        await applyServerResponse(0, SERVER_DEMAND);
        expect(getReconnectRequests()).toHaveLength(1);

        await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, NEWER_SERVER_DEMAND);
        await waitForCondition(() => getReconnectRequests().length > 1, 'reconnect for the newer NVP demand');

        expect(getReconnectRequests()).toHaveLength(2);
    });

    it('does not fire a redundant reconnect on the clear-and-seed path and seeds client-now when the NVP is empty', async () => {
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(mockWriteCommand).not.toHaveBeenCalled();
        expect(latestReceipt).toBe(CLIENT_NOW);
    });
});
