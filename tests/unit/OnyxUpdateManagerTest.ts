import Onyx from 'react-native-onyx';
import type {AppActionsMock} from '@libs/actions/__mocks__/App';
import * as AppImport from '@libs/actions/App';
import * as OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import * as OnyxUpdateManagerUtilsImport from '@libs/actions/OnyxUpdateManager/utils';
import type {OnyxUpdateManagerUtilsMock} from '@libs/actions/OnyxUpdateManager/utils/__mocks__';
import type {ApplyUpdatesMock} from '@libs/actions/OnyxUpdateManager/utils/__mocks__/applyUpdates';
import * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import createOnyxMockUpdate from '../utils/createOnyxMockUpdate';

jest.mock('@libs/actions/App');
jest.mock('@libs/actions/OnyxUpdateManager/utils');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;
const OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport as OnyxUpdateManagerUtilsMock;

const mockUpdate3 = createOnyxMockUpdate(3);
const offsetedMockUpdate3 = createOnyxMockUpdate(3, undefined, 2);
const mockUpdate4 = createOnyxMockUpdate(4);
const mockUpdate5 = createOnyxMockUpdate(5);
const mockUpdate6 = createOnyxMockUpdate(6);
const mockUpdate7 = createOnyxMockUpdate(7);
const mockUpdate8 = createOnyxMockUpdate(8);

describe('OnyxUpdateManager', () => {
    let lastUpdateIDAppliedToClient = 1;
    beforeAll(() => {
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 1),
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
        OnyxUpdateManagerUtils.mockValues.onValidateAndApplyDeferredUpdates = undefined;
        ApplyUpdates.mockValues.onApplyUpdates = undefined;
        OnyxUpdateManager.resetDeferralLogicVariables();
    });

    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(5);

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
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledWith({3: mockUpdate3, 4: mockUpdate4, 5: mockUpdate5});
        });
    });

    it('should only apply deferred updates that are newer than the last locally applied update (pending updates)', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        OnyxUpdateManagerUtils.mockValues.onValidateAndApplyDeferredUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
            // while we are waiting for the missing updates to be fetched.
            // Only the deferred updates after the lastUpdateIDAppliedToClient should be applied.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            OnyxUpdateManagerUtils.mockValues.onValidateAndApplyDeferredUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(6);

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
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledWith({6: mockUpdate6});
        });
    });

    it('should re-fetch missing updates if the deferred updates have a gap', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(6);

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
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates. 3-4
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);

            // After the gap in the deferred updates has been resolved, the remaining deferred updates (5, 6) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {5: mockUpdate5, 6: mockUpdate6});
        });
    });

    it('should re-fetch missing deferred updates only once per batch', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate8);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(8);

            // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);

            // After the initial missing updates have been applied, the applicable updates (3-4) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3, 4: mockUpdate4});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap (4-7) in the deferred updates.
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 7);

            // After the gap in the deferred updates has been resolved, the remaining deferred updates (8) should be applied.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {8: mockUpdate8});
        });
    });

    it('should not re-fetch missing updates if the lastUpdateIDFromClient has been updated', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate7);

        ApplyUpdates.mockValues.onApplyUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
            // while the applicable updates have been applied.
            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
            // without triggering another re-fetching of missing updates from the server.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            ApplyUpdates.mockValues.onApplyUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(7);

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
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3});

            // Since the lastUpdateIDAppliedToClient has changed to 5 in the meantime, we only need to apply the remaining deferred updates (6-7).
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {6: mockUpdate6, 7: mockUpdate7});
        });
    });

    it('should re-fetch missing updates if the lastUpdateIDFromClient has increased, but there are still gaps after the locally applied update', async () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate7);

        ApplyUpdates.mockValues.onApplyUpdates = async () => {
            // We manually update the lastUpdateIDAppliedToClient to 4, to simulate local updates being applied,
            // while the applicable updates have been applied.
            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
            // without triggering another re-fetching of missing updates from the server.
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 4);
            ApplyUpdates.mockValues.onApplyUpdates = undefined;
        };

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(7);

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
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3});

            // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates,
            // that are later than the locally applied update (4-6). (including the last locally applied update)
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 6);

            // Since the lastUpdateIDAppliedToClient has changed to 4 in the meantime and we're fetching updates 5-6 we only need to apply the remaining deferred updates (7).
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {7: mockUpdate7});
        });
    });

    it('should only fetch missing updates that are not outdated (older than already locally applied update)', () => {
        OnyxUpdateManager.handleOnyxUpdateGap(offsetedMockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);

        return OnyxUpdateManager.queryPromise.then(() => {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 4.
            expect(lastUpdateIDAppliedToClient).toBe(4);

            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);

            // There should be only one call to applyUpdates. The call should contain all the deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledWith({3: offsetedMockUpdate3, 4: mockUpdate4});

            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
});
