import PusherUtils from '@libs/PusherUtils';

import CONST from '@src/CONST';
import {apply, doesClientNeedToBeUpdated} from '@src/libs/actions/OnyxUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const pusherUpdate = (previousUpdateID: number, lastUpdateID: number): OnyxUpdatesFromServer<OnyxKey> => ({
    type: CONST.ONYX_UPDATE_TYPES.PUSHER,
    previousUpdateID,
    lastUpdateID,
    updates: [{eventType: 'onyxApiUpdate', data: []}],
});

// A rejected Pusher apply leaves the module-scoped pusherEventsPromise rejected for the rest of the module's life,
// so this lives in its own file rather than poisoning the chain for the other tests.
describe('OnyxUpdates, when a Pusher apply fails', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('relies on pusherEventsPromise staying rejected to stop a follower whose gap check the failed update had suppressed', async () => {
        // Given the client is caught up to update 10 and update 20 from Pusher is held mid-apply
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        let failHeldApply: (error: Error) => void = () => {};
        let handlerCallCount = 0;
        const handlerSpy = jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockImplementation(() => {
            handlerCallCount += 1;
            if (handlerCallCount > 1) {
                return Promise.resolve();
            }
            return new Promise<void>((resolve, reject) => {
                failHeldApply = reject;
            });
        });
        const heldApply = apply(pusherUpdate(10, 20));
        await waitForBatchedUpdates();

        // When update 30 arrives chained on it, so the pending marker tells it there is no gap
        expect(doesClientNeedToBeUpdated({previousUpdateID: 20, updateType: CONST.ONYX_UPDATE_TYPES.PUSHER})).toBe(false);
        const followerApply = apply(pusherUpdate(20, 30));
        await waitForBatchedUpdates();

        // And update 20 then fails to apply
        failHeldApply(new Error('storage write failed'));
        await expect(heldApply).rejects.toThrow('storage write failed');
        await expect(followerApply).rejects.toThrow('storage write failed');
        await waitForBatchedUpdates();

        // Then update 30 is never written either. Nothing checks that update IDs are contiguous before advancing the
        // watermark, so were it written the watermark would move to 30 and updates 11 to 20 would be lost with no gap
        // left to trigger recovery. Serializing on pusherEventsPromise is the only thing preventing that.
        expect(handlerCallCount).toBe(1);
        expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(10);

        // And both updates are back in the gap, so recovery can refetch them
        expect(doesClientNeedToBeUpdated({previousUpdateID: 20, updateType: CONST.ONYX_UPDATE_TYPES.PUSHER})).toBe(true);
        expect(doesClientNeedToBeUpdated({previousUpdateID: 30, updateType: CONST.ONYX_UPDATE_TYPES.PUSHER})).toBe(true);

        handlerSpy.mockRestore();
    });
});
