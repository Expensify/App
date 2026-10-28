import {acceptSpotnanaTerms, clearFlightBooking, getFlightFareRules, searchFlights, searchTravelAirports, setTravelProvisioningTaxID, startFlightCheckout} from '@libs/actions/Travel';
import {makeRequestWithSideEffects, read} from '@libs/API';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelProvisioning} from '@src/types/onyx';
import type {FlightSearchLeg} from '@src/types/onyx/TravelFlightSearch';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockRead = jest.mocked(read);

const DOMAIN = 'example.com';
const POLICY_ID = 'policy-1';
const TAX_ID = 'DE123456789';
const SEARCH_ID = 'search-leg-0';
const FARE_ID = 'fare-row1-a';
const ROUND_TRIP_LEGS: FlightSearchLeg[] = [
    {origin: {code: 'SFO'}, destination: {code: 'NYC', isCity: true}, date: '2026-12-08'},
    {origin: {code: 'NYC', isCity: true}, destination: {code: 'SFO'}, date: '2026-12-11'},
];

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

    describe('searchFlights', () => {
        it('sends the legs and filters as JSON and replaces the previous search with a loading state', () => {
            // Given a round trip search for the first leg with a nonstop filter
            const filters = {maxStops: 0};

            // When the traveler searches
            searchFlights(POLICY_ID, ROUND_TRIP_LEGS, filters);

            // Then the first leg is searched with no previous search, and the old results are cleared while loading
            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.SEARCH_FLIGHTS,
                {policyID: POLICY_ID, legs: JSON.stringify(ROUND_TRIP_LEGS), filters: JSON.stringify(filters), searchID: '', selectedFareID: '', legIndex: 0},
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.SET,
                            key: ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH,
                            value: {query: {policyID: POLICY_ID, legs: ROUND_TRIP_LEGS, filters}, legIndex: 0, isLoading: true},
                        },
                    ],
                }),
            );
        });

        it('carries the previous search and picked fare to the return leg and shows an error when the request fails', () => {
            // Given the traveler picked an outbound fare
            // When the return leg is searched
            searchFlights(POLICY_ID, ROUND_TRIP_LEGS, {}, 1, SEARCH_ID, FARE_ID);

            // Then the request names the previous search and fare, and a failed request stops loading with an error
            const [command, params, onyxData] = mockRead.mock.calls.at(0) ?? [];
            expect(command).toBe(READ_COMMANDS.SEARCH_FLIGHTS);
            expect(params).toEqual(expect.objectContaining({searchID: SEARCH_ID, selectedFareID: FARE_ID, legIndex: 1}));
            const failureUpdate = onyxData?.failureData?.at(0);
            expect(failureUpdate?.key).toBe(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH);
            expect(failureUpdate?.value).toMatchObject({isLoading: false});
            expect(failureUpdate?.value).toHaveProperty('errors');
        });
    });

    describe('startFlightCheckout', () => {
        it('replaces the previous checkout with a loading state and shows an error when the request fails', () => {
            // Given the traveler picked the fare for the last leg
            // When checkout starts
            startFlightCheckout(POLICY_ID, SEARCH_ID, FARE_ID);

            // Then the previous checkout is replaced while loading, and a failed request stops loading with an error
            const [command, params, onyxData] = mockRead.mock.calls.at(0) ?? [];
            expect(command).toBe(READ_COMMANDS.START_FLIGHT_CHECKOUT);
            expect(params).toEqual({policyID: POLICY_ID, searchID: SEARCH_ID, fareID: FARE_ID});
            expect(onyxData?.optimisticData).toEqual([
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT,
                    value: {policyID: POLICY_ID, searchID: SEARCH_ID, fareID: FARE_ID, isLoading: true},
                },
            ]);
            const failureUpdate = onyxData?.failureData?.at(0);
            expect(failureUpdate?.key).toBe(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT);
            expect(failureUpdate?.value).toMatchObject({isLoading: false});
            expect(failureUpdate?.value).toHaveProperty('errors');
        });
    });

    describe('searchTravelAirports and getFlightFareRules', () => {
        it('return what the server sends, or an empty list when it sends nothing', async () => {
            // Given the server returns airports once and then a response without them or fare rules
            const airports = [
                {
                    code: 'JFK',
                    name: 'John F. Kennedy International Airport',
                    cityCode: 'NYC',
                    cityName: 'New York City',
                    stateName: 'New York',
                    countryCode: 'US',
                    countryName: 'United States',
                },
            ];
            mockMakeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 200, airports}).mockResolvedValueOnce({jsonCode: 200}).mockResolvedValueOnce({jsonCode: 200});

            // When the picker and the fare rules screen request their data
            const foundAirports = await searchTravelAirports(POLICY_ID, 'new york');
            const noAirports = await searchTravelAirports(POLICY_ID, 'zz');
            const fareRules = await getFlightFareRules(POLICY_ID, SEARCH_ID, FARE_ID);

            // Then each gets the server's list, or an empty list it can render without a null check
            expect(mockMakeRequestWithSideEffects).toHaveBeenNthCalledWith(1, SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_TRAVEL_AIRPORTS, {policyID: POLICY_ID, query: 'new york'});
            expect(mockMakeRequestWithSideEffects).toHaveBeenNthCalledWith(3, SIDE_EFFECT_REQUEST_COMMANDS.GET_FLIGHT_FARE_RULES, {
                policyID: POLICY_ID,
                searchID: SEARCH_ID,
                fareID: FARE_ID,
            });
            expect(foundAirports).toEqual(airports);
            expect(noAirports).toEqual([]);
            expect(fareRules).toEqual([]);
        });
    });

    describe('clearFlightBooking', () => {
        it('clears the search and checkout when the traveler leaves the flow', async () => {
            // Given a search and a checkout in progress
            await Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH, {searchID: SEARCH_ID, isLoading: false});
            await Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT, {fareID: FARE_ID, isLoading: false});

            // When the traveler leaves the booking flow
            clearFlightBooking();
            await waitForBatchedUpdates();

            // Then neither key keeps any data
            const [search, checkout] = await Promise.all([
                new Promise((resolve) => {
                    const connection = Onyx.connect({
                        key: ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH,
                        callback: (value) => {
                            Onyx.disconnect(connection);
                            resolve(value);
                        },
                    });
                }),
                new Promise((resolve) => {
                    const connection = Onyx.connect({
                        key: ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT,
                        callback: (value) => {
                            Onyx.disconnect(connection);
                            resolve(value);
                        },
                    });
                }),
            ]);
            expect(search).toBeUndefined();
            expect(checkout).toBeUndefined();
        });
    });
});
