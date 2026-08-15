import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

            const policy = await new Promise<Policy | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(policy?.travelSettings?.isCodingSyncEnabled).toBeUndefined();
            expect(policy?.pendingFields?.travelSettings).toBeFalsy();
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

            const policy = await new Promise<Policy | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(policy?.travelSettings?.autoAddTripName).toBe(true);
            expect(policy?.errorFields?.travelSettings).toBeTruthy();
        });

        it('applies the optimistic update and clears pending state on success', async () => {
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: undefined};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            mockFetch?.pause?.();
            setPolicyTravelSettings(fakePolicy, {isCodingSyncEnabled: true});
            await waitForBatchedUpdates();

            const optimisticPolicy = await new Promise<Policy | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            expect(optimisticPolicy?.travelSettings?.isCodingSyncEnabled).toBe(true);
            expect(optimisticPolicy?.pendingFields?.travelSettings).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            const settledPolicy = await new Promise<Policy | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            expect(settledPolicy?.travelSettings?.isCodingSyncEnabled).toBe(true);
            expect(settledPolicy?.pendingFields?.travelSettings).toBeFalsy();
        });
    });
});
