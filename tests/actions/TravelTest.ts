import {acceptSpotnanaTerms, requestTravelAccess, setTravelProvisioningTaxID} from '@libs/actions/Travel';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelProvisioning, TravelSettings} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);

const DOMAIN = 'example.com';
const POLICY_ID = 'policy-1';
const TAX_ID = 'DE123456789';

describe('actions/Travel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('acceptSpotnanaTerms', () => {
        it('forwards the tax ID in the request params and the optimistic policy update', () => {
            acceptSpotnanaTerms(DOMAIN, POLICY_ID, TAX_ID);

            expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS,
                {domainName: DOMAIN, policyID: POLICY_ID, taxID: TAX_ID},
                expect.objectContaining({
                    successData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                            value: {travelSettings: {hasAcceptedTerms: true, taxID: TAX_ID}},
                        },
                    ]),
                }),
            );
        });

        it('omits the tax ID from the policy update when none is provided', () => {
            acceptSpotnanaTerms(DOMAIN, POLICY_ID);

            expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS,
                {domainName: DOMAIN, policyID: POLICY_ID, taxID: undefined},
                expect.objectContaining({
                    successData: expect.arrayContaining([
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                            value: {travelSettings: {hasAcceptedTerms: true}},
                        },
                    ]),
                }),
            );
        });
    });

    describe('requestTravelAccess', () => {
        const getTravelSettings = () =>
            new Promise<OnyxEntry<TravelSettings>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

        it('resolves true and clears a pending request when the account can skip verification', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {lastTravelSignupRequestTime: '1759152000000'});
            mockMakeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 200, canSkipVerification: true});

            await expect(requestTravelAccess()).resolves.toBe(true);
            await waitForBatchedUpdates();

            expect((await getTravelSettings())?.lastTravelSignupRequestTime).toBeUndefined();
        });

        it('resolves false and records the request time when the account needs a guide review', async () => {
            mockMakeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 200, canSkipVerification: false});

            await expect(requestTravelAccess()).resolves.toBe(false);
            await waitForBatchedUpdates();

            expect((await getTravelSettings())?.lastTravelSignupRequestTime).toBeTruthy();
        });

        it('rejects without recording a request time when the server returns an error', async () => {
            mockMakeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 401, message: 'You must be an admin to request travel access'});

            await expect(requestTravelAccess()).rejects.toThrow('You must be an admin to request travel access');
            await waitForBatchedUpdates();

            expect((await getTravelSettings())?.lastTravelSignupRequestTime).toBeUndefined();
        });
    });

    describe('setTravelProvisioningTaxID', () => {
        it('stores the tax ID on the travel provisioning session', async () => {
            setTravelProvisioningTaxID(TAX_ID);
            await waitForBatchedUpdates();

            const travelProvisioning = await new Promise<OnyxEntry<TravelProvisioning>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.TRAVEL_PROVISIONING,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(travelProvisioning?.taxID).toBe(TAX_ID);
        });
    });
});
