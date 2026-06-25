import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {acceptSpotnanaTerms, setTravelProvisioningTaxID} from '@libs/actions/Travel';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelProvisioning} from '@src/types/onyx';
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
