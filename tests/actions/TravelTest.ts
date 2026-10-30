import {acceptSpotnanaTerms, clearFlightBooking, getFlightFareRules, searchFlights, searchTravelAirports, setTravelProvisioningTaxID, startFlightCheckout} from '@libs/actions/Travel';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelProvisioning} from '@src/types/onyx';
import type {FlightSearchLeg} from '@src/types/onyx/TravelFlightSearch';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);

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
        it('shows flight schedules while prices load, then replaces them with the priced results', async () => {
            // Given the schedule search answers right away and the priced search answers later
            const scheduleItineraries = [{itineraryID: 'UA368@2027-01-21T23:30:00', flights: []}];
            const itineraries = [{itineraryID: 'flight_1', flights: [], fares: []}];
            let resolvePricedSearch: (response: {jsonCode: number; searchID: string; legIndex: number; itineraries: typeof itineraries; isExpressSearch: boolean}) => void = () => {};
            mockMakeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 200, itineraries: scheduleItineraries}).mockReturnValueOnce(
                new Promise((resolve) => {
                    resolvePricedSearch = resolve;
                }),
            );

            // When the traveler searches a round trip with a nonstop filter
            const searchRequest = searchFlights(POLICY_ID, ROUND_TRIP_LEGS, {maxStops: 0});
            await waitForBatchedUpdates();

            // Then both searches are sent with the same parameters, and the schedules show while prices load
            const parameters = {
                policyID: POLICY_ID,
                legs: JSON.stringify(ROUND_TRIP_LEGS),
                filters: JSON.stringify({maxStops: 0}),
                searchID: '',
                selectedFareID: '',
                legIndex: 0,
                shouldShowAllFlights: false,
            };
            expect(mockMakeRequestWithSideEffects).toHaveBeenNthCalledWith(1, SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_FLIGHT_SCHEDULES, parameters);
            expect(mockMakeRequestWithSideEffects).toHaveBeenNthCalledWith(2, SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_FLIGHTS, parameters);
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH)).toMatchObject({scheduleItineraries, isLoading: true});

            // When the priced results arrive
            resolvePricedSearch({jsonCode: 200, searchID: SEARCH_ID, legIndex: 0, itineraries, isExpressSearch: true});
            await searchRequest;
            await waitForBatchedUpdates();

            // Then they replace the schedules, and an express search is noted so every flight can be asked for
            const flightSearch = await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH);
            expect(flightSearch).toMatchObject({query: {policyID: POLICY_ID, legs: ROUND_TRIP_LEGS}, searchID: SEARCH_ID, legIndex: 0, itineraries, isExpressSearch: true, isLoading: false});
            expect(flightSearch?.scheduleItineraries).toBeUndefined();
        });

        it('carries the previous search and picked fare to the return leg and shows an error when the request fails', async () => {
            // Given the schedules load but the priced search fails
            mockMakeRequestWithSideEffects
                .mockResolvedValueOnce({jsonCode: 200, itineraries: [{itineraryID: 'UA368@2027-01-21T23:30:00', flights: []}]})
                .mockResolvedValueOnce({jsonCode: 517, message: '517 Spotnana error'});

            // When the return leg is searched
            await searchFlights(POLICY_ID, ROUND_TRIP_LEGS, {}, 1, SEARCH_ID, FARE_ID, true);
            await waitForBatchedUpdates();

            // Then the request names the previous search and fare, and loading stops with an error and no schedules left showing
            expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_FLIGHTS,
                expect.objectContaining({searchID: SEARCH_ID, selectedFareID: FARE_ID, legIndex: 1, shouldShowAllFlights: true}),
            );
            const flightSearch = await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH);
            expect(flightSearch?.isLoading).toBe(false);
            expect(flightSearch).toHaveProperty('errors');
            expect(flightSearch?.scheduleItineraries).toBeUndefined();
        });

        it('ignores results from a search the traveler has since replaced', async () => {
            // Given a first search whose priced results arrive after the traveler starts a second search
            let resolveFirstSearch: (response: {jsonCode: number; searchID: string; itineraries: Array<{itineraryID: string; flights: []}>}) => void = () => {};
            mockMakeRequestWithSideEffects
                .mockResolvedValueOnce({jsonCode: 500})
                .mockReturnValueOnce(
                    new Promise((resolve) => {
                        resolveFirstSearch = resolve;
                    }),
                )
                .mockResolvedValueOnce({jsonCode: 500})
                .mockResolvedValueOnce({jsonCode: 200, searchID: 'second-search', itineraries: []});
            const firstSearch = searchFlights(POLICY_ID, ROUND_TRIP_LEGS);
            await searchFlights(POLICY_ID, ROUND_TRIP_LEGS, {maxStops: 0});

            // When the first search's results arrive
            resolveFirstSearch({jsonCode: 200, searchID: 'first-search', itineraries: [{itineraryID: 'stale', flights: []}]});
            await firstSearch;
            await waitForBatchedUpdates();

            // Then the second search's results stay
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH)).toMatchObject({searchID: 'second-search', itineraries: [], query: {filters: {maxStops: 0}}});
        });
    });

    describe('startFlightCheckout', () => {
        it('stores the checkout the server returns, and shows an error when the request fails', async () => {
            // Given the server returns a checkout once and then fails
            mockMakeRequestWithSideEffects
                .mockResolvedValueOnce({jsonCode: 200, checkoutResponseID: 'checkout-response-id', requiredTravelerFields: ['DATE_OF_BIRTH']})
                .mockRejectedValueOnce(new Error('Network error'));

            // When checkout starts for the picked fare
            await startFlightCheckout(POLICY_ID, SEARCH_ID, FARE_ID);
            await waitForBatchedUpdates();

            // Then the checkout is stored for the picked fare
            expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.START_FLIGHT_CHECKOUT, {policyID: POLICY_ID, searchID: SEARCH_ID, fareID: FARE_ID});
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT)).toMatchObject({
                policyID: POLICY_ID,
                fareID: FARE_ID,
                checkoutResponseID: 'checkout-response-id',
                requiredTravelerFields: ['DATE_OF_BIRTH'],
                isLoading: false,
            });

            // When checkout is started again and the request fails
            await startFlightCheckout(POLICY_ID, SEARCH_ID, FARE_ID);
            await waitForBatchedUpdates();

            // Then the previous checkout is replaced, and loading stops with an error
            const flightCheckout = await getOnyxValue(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT);
            expect(flightCheckout?.checkoutResponseID).toBeUndefined();
            expect(flightCheckout?.isLoading).toBe(false);
            expect(flightCheckout).toHaveProperty('errors');
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
