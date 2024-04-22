import Onyx from 'react-native-onyx';
import * as AppImport from '@libs/actions/App';
import * as OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import deferredUpdatesProxy from '@libs/actions/OnyxUpdateManager/utils/deferredUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/App');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

type AppActionsMock = typeof AppImport & {
    shouldGetMissingOnyxUpdatesUpToIdProxy: Record<'shouldGetMissingOnyxUpdatesUpToId', number>;
    getMissingOnyxUpdates: jest.Mock<Promise<void[]>>;
    getMissingOnyxUpdatesTriggeredPromise: Promise<void>;
    getMissingOnyxUpdatesDonePromise: Promise<void>;
};

type ApplyUpdatesMock = typeof ApplyUpdatesImport & {
    applyUpdates: jest.Mock<Promise<void[]>>;
    applyUpdatesTriggeredPromise: Promise<void>;
};

const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;

const createMockUpdate = (lastUpdateID: number): OnyxUpdatesFromServer => ({
    type: 'https',
    lastUpdateID,
    previousUpdateID: lastUpdateID - 1,
    request: {
        command: 'TestCommand',
        successData: [],
        failureData: [],
        finallyData: [],
        optimisticData: [],
    },
    response: {
        lastUpdateID,
        previousUpdateID: lastUpdateID - 1,
    },
    updates: [
        {
            eventType: 'test',
            data: [],
        },
    ],
});
const mockUpdate3 = createMockUpdate(3);
const mockUpdate4 = createMockUpdate(4);
const mockUpdate5 = createMockUpdate(5);
const mockUpdate6 = createMockUpdate(6);

const resetOnyxUpdateManager = async () => {
    App.shouldGetMissingOnyxUpdatesUpToIdProxy.shouldGetMissingOnyxUpdatesUpToId = 2;
    await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
    OnyxUpdateManager.resetDeferralLogicVariables();
};

describe('OnyxUpdateManager', () => {
    let lastUpdateIDAppliedToClient = 1;

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await resetOnyxUpdateManager();
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 1),
        });
        return waitForBatchedUpdates();
    });

    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                // Missing updates from 1 (last applied to client) to 2 (last "previousUpdateID" from first deferred update) should have been fetched from the server
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
                // All scheduled updates should have been added to the deferred list
                expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(3);
            })
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                expect(lastUpdateIDAppliedToClient).toBe(5);

                // There should be only one call to applyUpdates. The call should contain all the deferred update,
                // since the locally applied updates have changed in the meantime.
                expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(ApplyUpdates.applyUpdates).toHaveBeenCalledWith({3: mockUpdate3, 4: mockUpdate4, 5: mockUpdate5});
            });
    });

    it('should only apply deferred updates that are after the locally applied update (pending updates)', async () => {
        App.shouldGetMissingOnyxUpdatesUpToIdProxy.shouldGetMissingOnyxUpdatesUpToId = 3;

        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                // Missing updates from 1 (last applied to client) to 3 (last "previousUpdateID" from first deferred update) should have been fetched from the server
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 3);
                // All scheduled updates should have been added to the deferred list
                expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(3);

                // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
                // while we are waiting for the missing updates to be fetched.
                // Only the deferred updates after the lastUpdateIDAppliedToClient should be applied.
                return Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            })
            .then(() => ApplyUpdates.applyUpdatesTriggeredPromise)
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                expect(lastUpdateIDAppliedToClient).toBe(6);

                // There should be only one call to applyUpdates. The call should only contain the last deferred update,
                // since the locally applied updates have changed in the meantime.
                expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(ApplyUpdates.applyUpdates).toHaveBeenCalledWith({6: mockUpdate6});
            });
    });

    it('should re-fetch missing updates if the deferred updates have a gap', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        return (
            App.getMissingOnyxUpdatesTriggeredPromise
                .then(() => {
                    // All scheduled updates should have been added to the deferred list
                    expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(3);
                })
                // The applicable updates (only update 3) should be applied first
                .then(() => ApplyUpdates.applyUpdatesTriggeredPromise)
                // After applying the applicable updates, the missing updates from 3 to 4 should be re-fetched
                .then(() => App.getMissingOnyxUpdatesTriggeredPromise)
                .then(() => {
                    // The deferred updates after the gap should now be in the list of dererred updates.
                    expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(2);
                })
                .then(waitForBatchedUpdates)
                .then(() => OnyxUpdateManager.queryPromise)
                ?.then(() => {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(6);

                    // There should be multiple calls getMissingOnyxUpdates and applyUpdates, since we detect a gap in the deferred updates.
                    // The first call to getMissingOnyxUpdates should fetch updates from 1 (last applied to client) to 2 (last "previousUpdateID" from first deferred update) from the server.
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3});

                    // The first call to getMissingOnyxUpdates should fetch updates from 1 (last applied to client) to 2 (last "previousUpdateID" from first deferred update) from the server.
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {5: mockUpdate5, 6: mockUpdate6});
                })
        );
    });
});
