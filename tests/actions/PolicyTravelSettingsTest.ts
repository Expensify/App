import {setPolicyTravelAutoEnableNewMembers, setPolicyTravelMemberAccess, setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import {WRITE_COMMANDS} from '@libs/API/types';

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

    describe('setPolicyTravelAutoEnableNewMembers', () => {
        it('sends its own command instead of saving the travel settings, so travel admins can change it', async () => {
            // Given a travel workspace where new members join with travel off
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: {autoEnableNewMembers: false}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When the setting is turned on
            mockFetch?.pause?.();
            setPolicyTravelAutoEnableNewMembers(fakePolicy, true);
            await waitForBatchedUpdates();

            // Then it shows as on and pending, and goes to the dedicated command rather than SetPolicyTravelSettings
            const optimisticPolicy = await getPolicy(fakePolicy.id);
            expect(optimisticPolicy?.travelSettings?.autoEnableNewMembers).toBe(true);
            expect(optimisticPolicy?.pendingFields?.autoEnableNewMembers).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.SET_POLICY_TRAVEL_AUTO_ENABLE_NEW_MEMBERS, 0, {policyID: fakePolicy.id, enabled: true});
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_POLICY_TRAVEL_SETTINGS, 0);

            // And the pending state clears once it saves
            const settledPolicy = await getPolicy(fakePolicy.id);
            expect(settledPolicy?.travelSettings?.autoEnableNewMembers).toBe(true);
            expect(settledPolicy?.pendingFields?.autoEnableNewMembers).toBeFalsy();
        });

        it('reverts the setting and shows an error when saving fails', async () => {
            // Given a travel workspace where new members join with travel on
            const fakePolicy: Policy = {...createRandomPolicy(0), travelSettings: {autoEnableNewMembers: true}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When turning it off fails
            mockFetch?.pause?.();
            setPolicyTravelAutoEnableNewMembers(fakePolicy, false);
            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the setting goes back to on with an error on the row
            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.travelSettings?.autoEnableNewMembers).toBe(true);
            expect(policy?.pendingFields?.autoEnableNewMembers).toBeFalsy();
            expect(policy?.errorFields?.autoEnableNewMembers).toBeTruthy();
        });
    });

    describe('setPolicyTravelMemberAccess', () => {
        it('restores travel access and shows the error when turning travel on fails', async () => {
            // Given a member with travel off
            const memberEmail = 'member@example.com';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                employeeList: {[memberEmail]: {email: memberEmail, role: CONST.POLICY.ROLE.USER, canUseTravel: false}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When travel is turned on for them and the request fails
            mockFetch.mockAPICommand(WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS, () => ({jsonCode: 400}));
            setPolicyTravelMemberAccess(fakePolicy, [{email: memberEmail, accountID: 2}], true);
            await waitForBatchedUpdates();

            // Then the member keeps travel off with the error, marked as a failed update so dismissing it keeps them in the list
            const employee = (await getPolicy(fakePolicy.id))?.employeeList?.[memberEmail];
            expect(employee?.canUseTravel).toBe(false);
            expect(employee?.errors).toBeTruthy();
            expect(employee?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });
    });
});
