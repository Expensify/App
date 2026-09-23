import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';

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

describe('actions/Policy/Travel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('setPolicyTravelSettings', () => {
        it('clears a toggled-on setting on failure when it was absent beforehand', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: undefined};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.pause?.();
            setPolicyTravelSettings(fakePolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);

            expect(policy?.travelSettings?.isCodingSyncEnabled).toBeUndefined();
            expect(policy?.pendingFields?.isCodingSyncEnabled).toBeFalsy();
        });

        it('reverts a toggled setting to its prior value on failure', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: {autoAddTripName: true}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.pause?.();
            setPolicyTravelSettings(fakePolicy, {autoAddTripName: false});
            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);

            expect(policy?.travelSettings?.autoAddTripName).toBe(true);
            expect(policy?.errorFields?.autoAddTripName).toBeTruthy();
        });

        it('applies the optimistic update and clears pending state on success', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: undefined};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.pause?.();
            setPolicyTravelSettings(fakePolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();

            const optimisticPolicy = await getPolicy(fakePolicy.id);
            expect(optimisticPolicy?.travelSettings?.isCodingSyncEnabled).toBe(true);
            expect(optimisticPolicy?.pendingFields?.isCodingSyncEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const settledPolicy = await getPolicy(fakePolicy.id);
            expect(settledPolicy?.travelSettings?.isCodingSyncEnabled).toBe(true);
            expect(settledPolicy?.pendingFields?.isCodingSyncEnabled).toBeFalsy();
        });

        it('clears the error from a failed update when the retry succeeds', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: undefined};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.fail?.();
            setPolicyTravelSettings(fakePolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();

            const failedPolicy = await getPolicy(fakePolicy.id);
            expect(failedPolicy?.errorFields?.isCodingSyncEnabled).toBeTruthy();

            mockFetch?.succeed?.();
            setPolicyTravelSettings(failedPolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();

            const retriedPolicy = await getPolicy(fakePolicy.id);
            expect(retriedPolicy?.travelSettings?.isCodingSyncEnabled).toBe(true);
            expect(retriedPolicy?.errorFields?.isCodingSyncEnabled).toBeFalsy();
        });

        it('leaves the other travel settings free of pending and error state', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: {autoAddTripName: true}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.pause?.();
            setPolicyTravelSettings(fakePolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();

            const pendingPolicy = await getPolicy(fakePolicy.id);
            expect(pendingPolicy?.pendingFields?.autoAddTripName).toBeFalsy();

            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const failedPolicy = await getPolicy(fakePolicy.id);
            expect(failedPolicy?.errorFields?.isCodingSyncEnabled).toBeTruthy();
            expect(failedPolicy?.errorFields?.autoAddTripName).toBeFalsy();
            expect(failedPolicy?.travelSettings?.autoAddTripName).toBe(true);
        });
    });
});
