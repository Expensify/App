import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import {isPaused as isSequentialQueuePaused, unpause as unpauseSequentialQueue} from '@libs/Network/SequentialQueue';
import PusherUtils from '@libs/PusherUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const pusherUpdate = (previousUpdateID: number, lastUpdateID: number): OnyxUpdatesFromServer<never> => ({
    type: CONST.ONYX_UPDATE_TYPES.PUSHER,
    previousUpdateID,
    lastUpdateID,
    updates: [{eventType: 'onyxApiUpdate', data: []}],
});

describe('actions/applyOnyxUpdatesReliably', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        unpauseSequentialQueue();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();
    });

    it('does not pause the queue for an event chained on an update that is still being applied', async () => {
        // Given update 20 arrived over Pusher and its apply is held mid-flight, so the watermark is still at 10
        let releaseApply: () => void = () => {};
        const handlerSpy = jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockReturnValueOnce(
            new Promise<void>((resolve) => {
                releaseApply = resolve;
            }),
        );
        const heldApply = applyOnyxUpdatesReliably(pusherUpdate(10, 20));
        await waitForBatchedUpdates();

        // When the next event arrives, chained on the update we are still applying
        const chainedApply = applyOnyxUpdatesReliably(pusherUpdate(20, 30));
        await waitForBatchedUpdates();

        // Then the queue is not paused to refetch data the client already received
        expect(isSequentialQueuePaused()).toBe(false);

        releaseApply();
        await heldApply;
        await chainedApply;
        handlerSpy.mockRestore();
    });

    it('does not let an update left mid-apply by the previous session mask a gap after signing back in', async () => {
        // Given update 20 arrived over Pusher and its apply is held mid-flight
        let releaseApply: () => void = () => {};
        const handlerSpy = jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockReturnValueOnce(
            new Promise<void>((resolve) => {
                releaseApply = resolve;
            }),
        );
        const heldApply = applyOnyxUpdatesReliably(pusherUpdate(10, 20));
        await waitForBatchedUpdates();

        // When the user signs out, which clears the persisted watermark
        await Onyx.clear();
        await waitForBatchedUpdates();

        // And an event chained on update 20 arrives in the new session
        const chainedApply = applyOnyxUpdatesReliably(pusherUpdate(20, 30));
        await waitForBatchedUpdates();

        // Then the queue is paused, because the new session never received update 20
        expect(isSequentialQueuePaused()).toBe(true);

        releaseApply();
        await heldApply;
        await chainedApply;
        handlerSpy.mockRestore();
    });

    // A failed apply leaves the module-level Pusher chain rejected, which poisons every later Pusher apply, so keep
    // this case last and add new ones above it.
    it('pauses the queue when the update it was waiting on failed to apply', async () => {
        // Given applying update 20 from Pusher failed
        const handlerSpy = jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockRejectedValueOnce(new Error('storage write failed'));
        await expect(applyOnyxUpdatesReliably(pusherUpdate(10, 20))).rejects.toThrow('storage write failed');
        await waitForBatchedUpdates();

        // When an event chained on that update arrives
        const chainedApply = applyOnyxUpdatesReliably(pusherUpdate(20, 30));
        chainedApply.catch(() => {});
        await waitForBatchedUpdates();

        // Then the queue is paused so the update that never landed can be refetched
        expect(isSequentialQueuePaused()).toBe(true);

        handlerSpy.mockRestore();
    });
});
