import Onyx from 'react-native-onyx';
import {setTravelProvisioningErrorMessage} from '@libs/actions/Travel';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelProvisioning} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

function getTravelProvisioningFromOnyx(): Promise<TravelProvisioning | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('Travel', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        Onyx.clear();
    });

    describe('setTravelProvisioningErrorMessage', () => {
        it('surfaces the backend error message so the terms screen can display it', async () => {
            // Given a provisioning session that is loading and carries a stale backend error code
            await Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {isLoading: true, error: 'missingWorkspaceAddress'});
            await waitForBatchedUpdates();

            // When an unhandled backend failure surfaces its message
            const message = 'Please add a workspace address to enable Expensify Travel.';
            setTravelProvisioningErrorMessage(message);
            await waitForBatchedUpdates();

            // Then the message is stored where the screen reads it, loading is cleared, and the stale code is gone
            const travelProvisioning = await getTravelProvisioningFromOnyx();
            expect(travelProvisioning?.isLoading).toBe(false);
            expect(travelProvisioning?.error).toBeUndefined();
            expect(getLatestErrorMessage(travelProvisioning)).toBe(message);
        });
    });
});
