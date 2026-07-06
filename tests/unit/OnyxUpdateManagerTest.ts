import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

import type {AppActionsMock} from '@userActions/__mocks__/App';
import type {OnyxUpdatesMock} from '@userActions/__mocks__/OnyxUpdates';
import * as AppImport from '@userActions/App';
import * as OnyxUpdateManager from '@userActions/OnyxUpdateManager';
import * as OnyxUpdateManagerUtilsImport from '@userActions/OnyxUpdateManager/utils';
import type {OnyxUpdateManagerUtilsMock} from '@userActions/OnyxUpdateManager/utils/__mocks__';
import type {ApplyUpdatesMock} from '@userActions/OnyxUpdateManager/utils/__mocks__/applyUpdates';
import * as ApplyUpdatesImport from '@userActions/OnyxUpdateManager/utils/applyUpdates';
import * as OnyxUpdatesImport from '@userActions/OnyxUpdates';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import OnyxUpdateMockUtils from '../utils/OnyxUpdateMockUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@userActions/OnyxUpdates');
jest.mock('@userActions/App');
jest.mock('@userActions/OnyxUpdateManager/utils');
jest.mock('@userActions/OnyxUpdateManager/utils/applyUpdates');

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

jest.mock('@src/libs/SearchUIUtils', () => ({
    getSuggestedSearches: jest.fn().mockReturnValue({}),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OnyxUpdates = OnyxUpdatesImport as OnyxUpdatesMock<any>;
const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;
const OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport as OnyxUpdateManagerUtilsMock;

const update2: OnyxUpdatesFromServer<never> = OnyxUpdateMockUtils.createUpdate(2);
const pendingUpdateUpTo2 = OnyxUpdateMockUtils.createPendingUpdate(2);

const update3: OnyxUpdatesFromServer<never> = OnyxUpdateMockUtils.createUpdate(3);
const pendingUpdateUpTo3 = OnyxUpdateMockUtils.createPendingUpdate(3);
const offsetUpdate3 = OnyxUpdateMockUtils.createUpdate(3, undefined, 1);

const update4 = OnyxUpdateMockUtils.createUpdate(4);
const update5 = OnyxUpdateMockUtils.createUpdate(5);
const update6 = OnyxUpdateMockUtils.createUpdate(6);
const update7 = OnyxUpdateMockUtils.createUpdate(7);
const update8 = OnyxUpdateMockUtils.createUpdate(8);

describe('OnyxUpdateManager', () => {
    let lastUpdateIDAppliedToClient = 1;
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 1),
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
        OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
        ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
        App.mockValues.missingOnyxUpdatesToBeApplied = undefined;
        App.mockValues.missingOnyxUpdatesResponse = undefined;
        OnyxUpdateManager.resetDeferralLogicVariables();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(5);

            // OnyxUpdates.apply should have been called 4 times,
            //   - once for the fetched missing update (2)
            //   - three times for the deferred updates (3-5)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(4);

            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);

            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be only one call to applyUpdates. The call should contain all the deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: update3, 4: update4, 5: update5});
        });
    });

    it('should only apply deferred updates that are newer than the last locally applied update (pending deferred updates)', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        OnyxUpdateManager.handleMissingOnyxUpdates(update6);

        OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
            // while we are waiting for the missing updates to be fetched.
            // Only the deferred updates after the lastUpdateIDAppliedToClient should be applied.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(6);

            // OnyxUpdates.apply should have been called 2 times,
            //   - twice for the fetched missing updates (2-3)
            //   - once for the deferred update (6)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(3);

            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);

            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // Missing updates from 1 (last applied to client) to 3 (last "previousUpdateID" from first deferred update) should have been fetched from the server in the first and only call to getMissingOnyxUpdates
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 3);

            // There should be only one call to applyUpdates. The call should only contain the last deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {6: update6});
        });
    });

    it('should re-fetch missing updates if the deferred updates have a gap', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        OnyxUpdateManager.handleMissingOnyxUpdates(update6);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(6);

            // OnyxUpdates.apply should have been called 5 times,
            //   - once for the first fetched missing update (2)
            //   - once for the second fetched missing update (4)
            //   - three times for the deferred updates (3, 5, 6)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(5);

            // Even though there is a gap in the deferred updates, we only want to fetch missing updates once per batch.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);

            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);

            // There should be multiple calls getMissingOnyxUpdates and applyUpdates, since we detect a gap in the deferred updates.
            // The first call to getMissingOnyxUpdates should fetch updates from 1 (last applied to client) to 2 (last "previousUpdateID" from first deferred update) from the server.
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);

            // After the initial missing updates have been applied, the applicable updates (3) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: update3});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates. 3-4
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);

            // After the gap in the deferred updates has been resolved, the remaining deferred updates (5, 6) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {5: update5, 6: update6});
        });
    });

    it('should re-fetch missing deferred updates only once per batch', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        OnyxUpdateManager.handleMissingOnyxUpdates(update6);
        OnyxUpdateManager.handleMissingOnyxUpdates(update8);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(8);

            // OnyxUpdates.apply should have been called 7 times,
            //   - once for the first fetched missing update (2)
            //   - once for the second fetched missing update (5)
            //   - once for the third fetched missing update (7)
            //   - four times for the deferred updates (3, 4, 6, 8)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(7);

            // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);

            // After the initial missing updates have been applied, the applicable updates (3-4) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: update3, 4: update4});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap (4-7) in the deferred updates.
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 7);

            // After the gap in the deferred updates has been resolved, the remaining deferred updates (8) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {8: update8});
        });
    });

    it('should not re-fetch missing updates if the lastUpdateIDFromClient has been updated', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        OnyxUpdateManager.handleMissingOnyxUpdates(update6);
        OnyxUpdateManager.handleMissingOnyxUpdates(update7);

        ApplyUpdates.mockValues.beforeApplyUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
            // while the applicable updates have been applied.
            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
            // without triggering another re-fetching of missing updates from the server.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(7);

            // OnyxUpdates.apply should have been called 4 times,
            //   - once for the first fetched missing update (2)
            //   - updates 3-5 are not fetched, because they are set externally
            //   - two times for the remaining deferred updates (6, 7)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(4);

            // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // Since there is a gap in the deferred updates, we need to run applyUpdates twice.
            // Once for the applicable updates (before the gap) and then for the remaining deferred updates.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);

            // After the initial missing updates have been applied, the applicable updates (3) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: update3});

            // Since the lastUpdateIDAppliedToClient has changed to 5 in the meantime, we only need to apply the remaining deferred updates (6-7).
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {6: update6, 7: update7});
        });
    });

    it('should re-fetch missing updates if the lastUpdateIDFromClient has increased, but there are still gaps after the locally applied update', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update7);

        ApplyUpdates.mockValues.beforeApplyUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 4, to simulate local updates being applied,
            // while the applicable updates have been applied.
            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
            // without triggering another re-fetching of missing updates from the server.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 4);
            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(7);

            // OnyxUpdates.apply should have been called 6 times,
            //   - once for the first fetched missing update (2)
            //   - updates 3-4 are not fetched, because they are set externally
            //   - three times for the second fetched missing updates (5-6)
            //   - once for the remaining deferred update (7)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(5);

            // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);

            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);

            // Since there is a gap in the deferred updates, we need to run applyUpdates twice.
            // Once for the applicable updates (before the gap) and then for the remaining deferred updates.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);

            // After the initial missing updates have been applied, the applicable updates (3) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: update3});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates,
            // that are later than the locally applied update (4-6). (including the last locally applied update)
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 6);

            // Since the lastUpdateIDAppliedToClient has changed to 4 in the meantime, and we're fetching updates 5-6 we only need to apply the remaining deferred updates (7).
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {7: update7});
        });
    });

    it('should only fetch missing updates that are not outdated (older than already locally applied update)', () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(offsetUpdate3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 4.
            expect(lastUpdateIDAppliedToClient).toBe(4);

            // OnyxUpdates.apply should have been called 2 times,
            //   - once for the first fetched missing update (2)
            //   - the offset update is omitted
            //   - three times for the deferred update (4)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(2);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be only one call to applyUpdates. The call should contain all the deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: offsetUpdate3, 4: update4});

            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });

    it('should fetch a single pending update if `hasPendingOnyxUpdates flag is true`', () => {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2];

        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo2);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all the pending update has been applied, the lastUpdateIDAppliedToClient should be 2.
            expect(lastUpdateIDAppliedToClient).toBe(2);

            // OnyxUpdates.apply should have been called 1 times,
            //   - once for the pending update (2)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(1);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be no call to applyUpdates, because there are no deferred updates
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(0);

            // There are no deferred updates, so this should only be called once for the pending update.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });

    it('should fetch multiple pending updates if `hasPendingOnyxUpdates flag is true`', () => {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2, update3];

        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo3);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all the pending update has been applied, the lastUpdateIDAppliedToClient should be 3.
            expect(lastUpdateIDAppliedToClient).toBe(3);

            // OnyxUpdates.apply should have been called 2 times,
            //   - twice for the pending updates (2, 3)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(2);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be no call to applyUpdates, because there are no deferred updates
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(0);

            // There are no deferred updates, so this should only be called once for the pending update.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });

    it('should not re-fetch missing updates when a duplicate arrives while a fetch is already in flight', async () => {
        // Fire a duplicate mid-cycle, after the deferred queue is drained but while the fetch is still in flight, to simulate a concurrent Pusher update.
        ApplyUpdates.mockValues.beforeApplyUpdates = async () => {
            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        };

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);

        return OnyxUpdateManager.queryPromise.then(() => {
            // The mid-cycle duplicate must be coalesced, not fire its own GetMissingOnyxMessages.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
        });
    });

    it('should resume the SequentialQueue exactly once when a duplicate arrives while a fetch is already in flight', async () => {
        const unpauseSpy = jest.spyOn(SequentialQueue, 'unpause');

        // Fire a duplicate mid-cycle, after the deferred queue is drained but while the fetch is still in flight, to simulate a concurrent Pusher update.
        ApplyUpdates.mockValues.beforeApplyUpdates = async () => {
            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        };

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);

        // queryPromise resolves on the first finalize, so drain microtasks first: a leaked second fetch would attach a second finalize and resume the queue again.
        return OnyxUpdateManager.queryPromise.then(waitForBatchedUpdates).then(() => {
            expect(unpauseSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('should defer and later fetch a brand-new update that arrives while a fetch is already in flight', async () => {
        // Fire a brand-new (higher) update mid-cycle, after the deferred queue is drained but while the fetch is still in flight, to simulate a concurrent Pusher update.
        ApplyUpdates.mockValues.beforeApplyUpdates = async () => {
            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
            OnyxUpdateManager.handleMissingOnyxUpdates(update7);
        };

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);

        return OnyxUpdateManager.queryPromise.then(() => {
            // The new update must not fire its own parallel GetMissingOnyxMessages, but must still be fetched in order and applied (client reaches 7).
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(3);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(3, 5, 6);
            expect(lastUpdateIDAppliedToClient).toBe(7);
        });
    });

    it('should apply an update that arrives mid-reconnect instead of dropping it when the queue is finalized', async () => {
        // First-ever reliable update: the client has never applied one, so the gap-handler takes the full-reconnect branch.
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 0);

        const reconnectSpy = jest.spyOn(App, 'finalReconnectAppAfterActivatingReliableUpdates').mockImplementation(async () => {
            // The reconnect response advances the client to update 2.
            await OnyxUpdates.apply(update2);
            await waitForBatchedUpdates();

            // A concurrent Pusher update lands while the reconnect promise is still in flight (after the client advanced to 2, before finalize).
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        });

        OnyxUpdateManager.handleMissingOnyxUpdates(update2);

        return OnyxUpdateManager.queryPromise.then(() => {
            // The mid-reconnect update must be applied in order, not cleared away by finalizeUpdatesAndResumeQueue (client reaches 3).
            expect(lastUpdateIDAppliedToClient).toBe(3);

            // It is contiguous with the reconnect response, so it must not trigger a redundant GetMissingOnyxMessages.
            expect(App.getMissingOnyxUpdates).not.toHaveBeenCalled();

            reconnectSpy.mockRestore();
        });
    });

    it('should escalate to a single incremental ReconnectApp when the gap fetch returns no progress', async () => {
        // Simulate the production stall: the server answers the gap fetch with a 200 that carries no updates
        // and no lastUpdateID, so the client cannot advance no matter how often the fetch is repeated.
        App.mockValues.missingOnyxUpdatesResponse = {jsonCode: 200, onyxData: []};
        const alertSpy = jest.spyOn(Log, 'alert');

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;

        // One useless answer is proof the server cannot close this gap: escalate right away to an
        // incremental ReconnectApp, fired from the stalled client update ID, and raise the alert that
        // makes stalled clients visible in production monitoring.
        expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        expect(App.reconnectApp).toHaveBeenCalledTimes(1);
        expect(App.reconnectApp).toHaveBeenCalledWith(1);
        expect(alertSpy).toHaveBeenCalledTimes(1);

        // A further gap push against the same client state must back off: no new fetch, no second reconnect.
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        expect(App.reconnectApp).toHaveBeenCalledTimes(1);

        // When the ReconnectApp response advances the client (simulated directly here), the guard releases
        // and a fresh gap is fetched again.
        App.mockValues.missingOnyxUpdatesResponse = undefined;
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);

        OnyxUpdateManager.handleMissingOnyxUpdates(update7);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
        expect(App.reconnectApp).toHaveBeenCalledTimes(1);
    });

    it('should not escalate to ReconnectApp when the gap fetch advances the client', async () => {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;

        expect(lastUpdateIDAppliedToClient).toBe(3);
        expect(App.reconnectApp).not.toHaveBeenCalled();
    });

    it('should not escalate or back off when the fetch response reports progress', async () => {
        // Progress is read from the response itself: its lastUpdateID is past the ID the fetch was fired
        // from, so this is not a stall even though nothing was applied yet.
        App.mockValues.missingOnyxUpdatesResponse = {jsonCode: 200, lastUpdateID: 2, onyxData: []};

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;
        expect(App.reconnectApp).not.toHaveBeenCalled();
        const fetchCalls = App.getMissingOnyxUpdates.mock.calls.length;

        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates.mock.calls.length).toBeGreaterThan(fetchCalls);
        expect(App.reconnectApp).not.toHaveBeenCalled();
    });

    it('should not escalate when the client advances through another path while the fetch is in flight', async () => {
        // The response itself reports no progress, but a contiguous update advanced the client mid-fetch,
        // so the next fetch fires from a new ID and the client can still catch up.
        App.getMissingOnyxUpdates.mockImplementationOnce(async () => {
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 2);
            return {jsonCode: 200, onyxData: []};
        });

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;

        expect(App.reconnectApp).not.toHaveBeenCalled();
    });

    it('should not escalate to ReconnectApp when the gap fetch fails', async () => {
        // A failed fetch proves nothing about the server's ability to serve the range, so it must neither
        // escalate nor latch the back-off: the next gap push retries the fetch as before.
        App.mockValues.missingOnyxUpdatesResponse = {jsonCode: 407};

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;
        expect(App.reconnectApp).not.toHaveBeenCalled();
        const fetchCallsAfterFailure = App.getMissingOnyxUpdates.mock.calls.length;

        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates.mock.calls.length).toBeGreaterThan(fetchCallsAfterFailure);
        expect(App.reconnectApp).not.toHaveBeenCalled();
    });

    it('should back off a pending-updates fetch that returns no progress', async () => {
        App.mockValues.missingOnyxUpdatesResponse = {jsonCode: 200, onyxData: []};

        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo2);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        expect(App.reconnectApp).toHaveBeenCalledTimes(1);

        // The pending-updates branch fires the same fetch as the gap branch, so it must back off the same way.
        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo3);
        await OnyxUpdateManager.queryPromise;
        expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        expect(App.reconnectApp).toHaveBeenCalledTimes(1);
    });

    it('should resume the SequentialQueue exactly once per backed-off gap push after escalating', async () => {
        // Escalation itself is asserted in the escalate test; here it is only the setup for the unpause check.
        App.mockValues.missingOnyxUpdatesResponse = {jsonCode: 200, onyxData: []};

        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        await OnyxUpdateManager.queryPromise;

        // The backed-off cycle must still finalize and resume the queue, or the app would freeze.
        const unpauseSpy = jest.spyOn(SequentialQueue, 'unpause');
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        // queryPromise resolves on the first finalize, so drain microtasks first: a leaked second finalize
        // would resume the queue a second time and must get the chance to surface before the assertion.
        await OnyxUpdateManager.queryPromise;
        await waitForBatchedUpdates();
        expect(unpauseSpy).toHaveBeenCalledTimes(1);
    });

    it('should apply deferred updates after fetching pending updates', () => {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2, update3];

        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 4.
            expect(lastUpdateIDAppliedToClient).toBe(4);

            // OnyxUpdates.apply should have been called 3 times,
            //   - twice for the pending updates (2, 3)
            //   - once for the deferred update (4)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(3);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be only one call to applyUpdates. The call should contain the deferred updates.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {4: update4});

            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
});
