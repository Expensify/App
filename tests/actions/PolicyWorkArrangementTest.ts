import {setPolicyWorkArrangement} from '@libs/actions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function getPolicy(policyID: string): Promise<Policy | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function buildHomeAndOfficePolicy(isOfficeWorkArrangement?: boolean): Policy {
    return {
        ...createRandomPolicy(0),
        commuterExclusions: {
            method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            ...(isOfficeWorkArrangement === undefined ? {} : {isOfficeWorkArrangement}),
        },
    };
}

describe('actions/Policy/DistanceRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('setPolicyWorkArrangement', () => {
        it('applies the arrangement optimistically and clears pending state on success', async () => {
            // Given a workspace on the home and office method that has never had an arrangement picked
            const fakePolicy = buildHomeAndOfficePolicy();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When the admin picks office-based and the request is still in flight
            mockFetch?.pause?.();
            setPolicyWorkArrangement(fakePolicy.id, true, undefined);
            await waitForBatchedUpdates();

            // Then the arrangement shows immediately, marked pending, without disturbing the method
            const optimisticPolicy = await getPolicy(fakePolicy.id);
            expect(optimisticPolicy?.commuterExclusions?.isOfficeWorkArrangement).toBe(true);
            expect(optimisticPolicy?.commuterExclusions?.method).toBe(CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE);
            expect(optimisticPolicy?.pendingFields?.commuterExclusions).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // And once the request lands the arrangement stays put with the pending state cleared
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const settledPolicy = await getPolicy(fakePolicy.id);
            expect(settledPolicy?.commuterExclusions?.isOfficeWorkArrangement).toBe(true);
            expect(settledPolicy?.pendingFields?.commuterExclusions).toBeFalsy();
        });

        it('clears the arrangement on failure when the workspace had none before', async () => {
            // Given a workspace whose admin has never picked an arrangement, so there is nothing to roll back to
            const fakePolicy = buildHomeAndOfficePolicy();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When the request fails
            mockFetch?.pause?.();
            setPolicyWorkArrangement(fakePolicy.id, true, undefined);
            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the workspace is left without an arrangement rather than keeping the one that never saved
            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.commuterExclusions?.isOfficeWorkArrangement).toBeUndefined();
            expect(policy?.pendingFields?.commuterExclusions).toBeFalsy();
            expect(policy?.errorFields?.commuterExclusions).toBeTruthy();
        });

        it('reverts to the previous arrangement on failure', async () => {
            // Given a workspace already set to office-based
            const fakePolicy = buildHomeAndOfficePolicy(true);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When switching it to no regular workplace fails
            mockFetch?.pause?.();
            setPolicyWorkArrangement(fakePolicy.id, false, true);
            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the arrangement the workspace was on is restored, not left on the failed value
            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.commuterExclusions?.isOfficeWorkArrangement).toBe(true);
            expect(policy?.errorFields?.commuterExclusions).toBeTruthy();
        });
    });
});
