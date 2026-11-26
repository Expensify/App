import {flushQueue, queueOnyxUpdates} from '@libs/actions/QueuedOnyxUpdates';
import {clear, getTimeline, setRecording} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

let now = 0;

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    clear();
    setRecording(true);
});

afterEach(() => {
    setRecording(false);
    clear();
    jest.restoreAllMocks();
});

describe('QueuedOnyxUpdates frame drop attribution', () => {
    it('records applying queued WRITE responses as an operation', async () => {
        // Given the response of a WRITE request queued until the request queue is empty
        jest.spyOn(Onyx, 'update').mockImplementation(() => {
            now = 300;
            return Promise.resolve();
        });
        queueOnyxUpdates([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NETWORK, value: {shouldForceOffline: false}}]);

        // When the queue is flushed
        now = 100;
        await flushQueue();

        // Then frames dropped while the updates were applied can be attributed to that operation
        expect(getTimeline().operations).toEqual([expect.objectContaining({name: CONST.TELEMETRY.FRAME_DROPS.OPERATION_QUEUED_UPDATES, start: 100, end: 300})]);
    });

    it('records nothing when the request queue empties without queued WRITE responses', async () => {
        // Given no queued updates, e.g. after a queue of READ requests
        jest.spyOn(Onyx, 'update').mockResolvedValue(undefined);

        // When the queue is flushed
        await flushQueue();

        // Then no frames are attributed to applying WRITE responses
        expect(getTimeline().operations).toEqual([]);
    });
});
