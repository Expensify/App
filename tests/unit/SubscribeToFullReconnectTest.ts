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

// The skew regime under test: the server's NVP demand is ahead of the client clock.
const CLIENT_NOW = '2026-06-12 10:00:00.000';
const SERVER_DEMAND = '2026-06-12 10:05:00.000';
const NEWER_SERVER_DEMAND = '2026-06-12 10:10:00.000';

// Ordered observation log: receipt writes (via the Onyx subscription below) and reconnect
// requests (via the API mock), so tests can assert seed-before-request ordering.
let events: Array<{type: 'receipt' | 'request'; value: string}> = [];
let capturedOnyxData: Array<NonNullable<Parameters<typeof writeWithNoDuplicatesConflictAction>[2]>> = [];
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
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
 * Simulates the server answering the captured ReconnectApp request the way applyHTTPSOnyxUpdates
 * does: response.onyxData (which re-delivers the NVP) is applied before successData (which
 * writes the LAST_FULL_RECONNECT_TIME receipt). Ends with a drain so any would-be re-arm (on
 * pre-fix code the client-now receipt re-triggers the subscription) surfaces before assertions.
 */
async function applyServerResponse(redeliveredNVP: string): Promise<void> {
    await Onyx.merge(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, redeliveredNVP);
    await waitForBatchedUpdates();
    await Onyx.update(capturedOnyxData.at(0)?.successData ?? []);
    await waitForBatchedUpdates();
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

        await applyServerResponse(SERVER_DEMAND);

        expect(getReconnectRequests()).toHaveLength(1);
        expect(mockWriteCommand.mock.calls).toHaveLength(1);
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(SERVER_DEMAND);
    });

    it('writes the receipt to max(now, NVP) before the reconnect request is created', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);

        const firstRequestIndex = events.findIndex((event) => event.type === 'request');
        const seedIndex = events.findIndex((event) => event.type === 'receipt' && event.value === SERVER_DEMAND);

        expect(firstRequestIndex).toBeGreaterThan(-1);
        expect(seedIndex).toBeGreaterThan(-1);
        expect(seedIndex).toBeLessThan(firstRequestIndex);
    });

    it('still fires a fresh reconnect when a genuinely newer NVP arrives after a completed cycle', async () => {
        await triggerFullReconnectDemand(SERVER_DEMAND);
        await applyServerResponse(SERVER_DEMAND);
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
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBe(CLIENT_NOW);
    });
});
