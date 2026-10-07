import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {addOfficeLocation, clearOfficeLocationErrors, deleteOfficeLocation, updateOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

const HEADQUARTERS_ADDRESS: CompanyAddress = {
    addressStreet: '88 Kearny St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94108',
    country: 'US',
};

const NEW_JERSEY_ADDRESS: CompanyAddress = {
    addressStreet: '900 Asbury Ave\nSuite 2',
    city: 'Ocean City',
    state: 'NJ',
    zipCode: '08226',
    country: 'US',
};

const HEADQUARTERS: OfficeLocation = {name: 'Headquarters', address: HEADQUARTERS_ADDRESS, isDefault: true};

function getPolicy(policyID: string): Promise<Policy | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            callback: (policy) => {
                Onyx.disconnect(connection);
                resolve(policy);
            },
        });
    });
}

function getRequestParams(command: typeof WRITE_COMMANDS.ADD_OFFICE_LOCATION | typeof WRITE_COMMANDS.UPDATE_OFFICE_LOCATION): Record<string, string> {
    const body = TestHelper.getFetchMockCalls(command).at(0)?.[1]?.body;
    if (!(body instanceof FormData)) {
        return {};
    }
    return Object.fromEntries(Array.from(body.entries(), ([key, value]) => [key, typeof value === 'string' ? value : '']));
}

describe('actions/PolicyOfficeLocation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    let policyID: string;
    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        mockFetch = fetch as MockFetch;
        await Onyx.clear();

        // Given a workspace whose only office is its primary one
        const policy = createRandomPolicy(0);
        policyID = policy.id;
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...policy, officeLocations: {OFFICE1: HEADQUARTERS}});
        await waitForBatchedUpdates();
    });

    describe('addOfficeLocation', () => {
        it('shows the new office as pending, makes it the primary office, and clears the pending state on success', async () => {
            // When a new office is added as the primary one while the request is in flight
            mockFetch?.pause?.();
            addOfficeLocation(policyID, {OFFICE1: HEADQUARTERS}, NEW_JERSEY_ADDRESS, true, 'New Jersey Office', 'Office location 2');
            await waitForBatchedUpdates();

            // Then the request carries the client-generated officeID and the address as JSON, which is how Auth reads it
            const params = getRequestParams(WRITE_COMMANDS.ADD_OFFICE_LOCATION);
            const newOfficeID = params.officeID;
            expect(JSON.parse(params.address)).toEqual(NEW_JERSEY_ADDRESS);

            // And the new office shows as pending, and the previous primary office stops being the primary one
            let officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(officeLocations[newOfficeID]).toMatchObject({
                name: 'New Jersey Office',
                address: NEW_JERSEY_ADDRESS,
                isDefault: true,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            expect(officeLocations.OFFICE1?.isDefault).toBe(false);

            // When the request succeeds
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the new office is no longer pending
            officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(officeLocations[newOfficeID]?.pendingAction).toBeFalsy();
        });

        it('keeps a failed office with its error, restores the primary office, and removes the failed office once the error is dismissed', async () => {
            // When adding a new primary office fails
            mockFetch?.fail?.();
            addOfficeLocation(policyID, {OFFICE1: HEADQUARTERS}, NEW_JERSEY_ADDRESS, true, 'New Jersey Office', 'Office location 2');
            await waitForBatchedUpdates();

            // Then the failed office stays visible as pending with an error, so the admin can see it didn't save
            const failedOfficeID = getRequestParams(WRITE_COMMANDS.ADD_OFFICE_LOCATION).officeID;
            let officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            const failedOffice = officeLocations[failedOfficeID];
            expect(failedOffice?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(Object.keys(failedOffice?.errors ?? {}).length).toBeGreaterThan(0);

            // And the previous primary office is the only primary one again
            expect(officeLocations.OFFICE1?.isDefault).toBe(true);
            expect(failedOffice?.isDefault).toBe(false);

            // When the error is dismissed
            clearOfficeLocationErrors(policyID, failedOfficeID, failedOffice?.pendingAction);
            await waitForBatchedUpdates();

            // Then the office that never reached the server is removed
            officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(Object.keys(officeLocations)).toEqual(['OFFICE1']);
        });
    });

    describe('addOfficeLocation without a name', () => {
        it('shows the default name until the server names the office, without sending a name', async () => {
            // When an office is added without a name while the request is in flight
            mockFetch?.pause?.();
            addOfficeLocation(policyID, {OFFICE1: HEADQUARTERS}, NEW_JERSEY_ADDRESS, false, '', 'Office location 2');
            await waitForBatchedUpdates();

            // Then no name is sent, so the server names the office
            const params = getRequestParams(WRITE_COMMANDS.ADD_OFFICE_LOCATION);
            expect(params.officeName).toBeUndefined();

            // And the office shows the default name meanwhile
            const officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(officeLocations[params.officeID]?.name).toBe('Office location 2');

            await mockFetch?.resume?.();
        });

        it('keeps an unsaved office pending addition when it is edited, so dismissing its error still removes it', async () => {
            // Given an office whose addition failed
            mockFetch?.fail?.();
            addOfficeLocation(policyID, {OFFICE1: HEADQUARTERS}, NEW_JERSEY_ADDRESS, false, 'New Jersey Office', 'Office location 2');
            await waitForBatchedUpdates();
            const failedOfficeID = getRequestParams(WRITE_COMMANDS.ADD_OFFICE_LOCATION).officeID;

            // When it is edited, which fails too since the server doesn't have it
            const officeLocations = (await getPolicy(policyID))?.officeLocations;
            updateOfficeLocation(policyID, officeLocations, failedOfficeID, {name: 'NJ Office'});
            await waitForBatchedUpdates();

            // Then it is still pending addition
            const failedOffice = (await getPolicy(policyID))?.officeLocations?.[failedOfficeID];
            expect(failedOffice?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            // And dismissing its error removes it, like any office that never reached the server
            clearOfficeLocationErrors(policyID, failedOfficeID, failedOffice?.pendingAction);
            await waitForBatchedUpdates();
            expect(Object.keys((await getPolicy(policyID))?.officeLocations ?? {})).toEqual(['OFFICE1']);
        });
    });

    describe('updateOfficeLocation', () => {
        it('shows the changes as pending and clears the pending state on success', async () => {
            // When the office is renamed and moved while the request is in flight
            mockFetch?.pause?.();
            updateOfficeLocation(policyID, {OFFICE1: HEADQUARTERS}, 'OFFICE1', {name: 'HQ', address: NEW_JERSEY_ADDRESS});
            await waitForBatchedUpdates();

            // Then the office shows the new values as pending
            let officeLocation = (await getPolicy(policyID))?.officeLocations?.OFFICE1;
            expect(officeLocation).toMatchObject({name: 'HQ', address: NEW_JERSEY_ADDRESS, isDefault: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});

            // And only the changed fields are sent
            const params = getRequestParams(WRITE_COMMANDS.UPDATE_OFFICE_LOCATION);
            expect(params.officeName).toBe('HQ');
            expect(JSON.parse(params.address)).toEqual(NEW_JERSEY_ADDRESS);
            expect(params.isDefault).toBeUndefined();

            // When the request succeeds
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the office keeps the new values and is no longer pending
            officeLocation = (await getPolicy(policyID))?.officeLocations?.OFFICE1;
            expect(officeLocation?.name).toBe('HQ');
            expect(officeLocation?.pendingAction).toBeFalsy();
        });

        it('restores both offices and shows an error when making another office the primary one fails', async () => {
            // Given a second office that isn't the primary one
            const newJerseyOffice: OfficeLocation = {name: 'New Jersey Office', address: NEW_JERSEY_ADDRESS, isDefault: false};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {officeLocations: {OFFICE2: newJerseyOffice}});

            // When making it the primary office fails
            mockFetch?.fail?.();
            updateOfficeLocation(policyID, {OFFICE1: HEADQUARTERS, OFFICE2: newJerseyOffice}, 'OFFICE2', {isDefault: true});
            await waitForBatchedUpdates();

            // Then the previous primary office is the primary one again, and the updated office shows an error
            let officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(officeLocations.OFFICE1?.isDefault).toBe(true);
            expect(officeLocations.OFFICE2?.isDefault).toBe(false);
            expect(officeLocations.OFFICE2?.pendingAction).toBeFalsy();
            expect(Object.keys(officeLocations.OFFICE2?.errors ?? {}).length).toBeGreaterThan(0);

            // When the error is dismissed
            clearOfficeLocationErrors(policyID, 'OFFICE2', officeLocations.OFFICE2?.pendingAction);
            await waitForBatchedUpdates();

            // Then the office stays, without the error, since it exists on the server
            officeLocations = (await getPolicy(policyID))?.officeLocations ?? {};
            expect(officeLocations.OFFICE2?.name).toBe('New Jersey Office');
            expect(officeLocations.OFFICE2?.errors).toBeFalsy();
        });
    });

    describe('deleteOfficeLocation', () => {
        it('shows the office as pending deletion and removes it on success', async () => {
            // When the office is deleted while the request is in flight
            mockFetch?.pause?.();
            deleteOfficeLocation(policyID, 'OFFICE1');
            await waitForBatchedUpdates();

            // Then it shows as pending deletion
            expect((await getPolicy(policyID))?.officeLocations?.OFFICE1?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

            // When the request succeeds
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then the office is removed
            expect((await getPolicy(policyID))?.officeLocations?.OFFICE1).toBeUndefined();
        });

        it('restores the office with an error when the deletion fails', async () => {
            // When deleting the office fails
            mockFetch?.fail?.();
            deleteOfficeLocation(policyID, 'OFFICE1');
            await waitForBatchedUpdates();

            // Then the office is back, with an error explaining it wasn't deleted
            const officeLocation = (await getPolicy(policyID))?.officeLocations?.OFFICE1;
            expect(officeLocation?.name).toBe('Headquarters');
            expect(officeLocation?.pendingAction).toBeFalsy();
            expect(Object.keys(officeLocation?.errors ?? {}).length).toBeGreaterThan(0);
        });
    });
});
