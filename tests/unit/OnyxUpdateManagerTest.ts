import Onyx from 'react-native-onyx';
import type {AppActionsMock} from '@userActions/__mocks__/App';
import type {OnyxUpdatesMock} from '@userActions/__mocks__/OnyxUpdates';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as AppImport from '@userActions/App';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as OnyxUpdateManager from '@userActions/OnyxUpdateManager';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as OnyxUpdateManagerUtilsImport from '@userActions/OnyxUpdateManager/utils';
import type {OnyxUpdateManagerUtilsMock} from '@userActions/OnyxUpdateManager/utils/__mocks__';
import type {ApplyUpdatesMock} from '@userActions/OnyxUpdateManager/utils/__mocks__/applyUpdates';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ApplyUpdatesImport from '@userActions/OnyxUpdateManager/utils/applyUpdates';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as OnyxUpdatesImport from '@userActions/OnyxUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import OnyxUpdateMockUtils from '../utils/OnyxUpdateMockUtils';

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

const OnyxUpdates = OnyxUpdatesImport as OnyxUpdatesMock;
const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;
const OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport as OnyxUpdateManagerUtilsMock;

const update2 = OnyxUpdateMockUtils.createUpdate(2);
const pendingUpdateUpTo2 = OnyxUpdateMockUtils.createPendingUpdate(2);

const update3 = OnyxUpdateMockUtils.createUpdate(3);
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
        OnyxUpdateManager.resetDeferralLogicVariables();
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
