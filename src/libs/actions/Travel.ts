import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {FlightFareRules, FlightSearchFilters, FlightSearchLeg, TravelAirport} from '@src/types/onyx/TravelFlightSearch';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms(domain?: string, policyID?: string, taxID?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_PROVISIONING | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                travelSettings: {
                    hasAcceptedTerms: true,
                    ...(taxID ? {taxID} : {}),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: false,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: AcceptSpotnanaTermsParams = {domainName: domain, policyID, taxID};

    // We need to call this API immediately to get the response and open the travel page.
    // See https://github.com/Expensify/App/pull/69769#discussion_r2368967354 for more info.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, {optimisticData, successData, failureData});
}

function requestTravelAccess() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                lastTravelSignupRequestTime: Date.now().toString(),
            },
        },
    ];
    API.write(WRITE_COMMANDS.TRAVEL_SIGNUP_REQUEST, null, {optimisticData});
}

function setTravelProvisioningTaxID(taxID: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {taxID});
}

function setTravelProvisioningDomain(domain: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {domain});
}

function setTravelProvisioningNextStep(nextStepRoute?: Route) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {nextStepRoute});
}

function setTravelProvisioningEnabledSteps(enabledSteps: string[]) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {enabledSteps});
}

/**
 * Returns the airports matching what the traveler typed in a flight search's From or To field
 */
function searchTravelAirports(policyID: string, query: string): Promise<TravelAirport[]> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method -- suggestions change with every keystroke and only the open picker reads them, so they are not stored in Onyx
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_TRAVEL_AIRPORTS, {policyID, query}).then((response) => response?.airports ?? []);
}

/**
 * Searches one leg of a flight search. The first leg is searched with an empty searchID; each later leg passes the
 * previous leg's searchID and the fare picked from it. The results replace travelFlightSearch.
 */
function searchFlights(policyID: string, legs: FlightSearchLeg[], filters: FlightSearchFilters = {}, legIndex = 0, searchID = '', selectedFareID = '') {
    Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH, {query: {policyID, legs, filters}, legIndex, isLoading: true});

    // eslint-disable-next-line rulesdir/no-api-side-effects-method -- the server returns the results instead of writing Onyx, so they are stored here
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SEARCH_FLIGHTS, {
        policyID,
        legs: JSON.stringify(legs),
        filters: JSON.stringify(filters),
        searchID,
        selectedFareID,
        legIndex,
    })
        .then((response) => {
            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                throw new Error(response?.message ?? 'Flight search failed');
            }
            Onyx.merge(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH, {
                searchID: response.searchID,
                legIndex: response.legIndex,
                itineraries: response.itineraries,
                filterOptions: response.filterOptions,
                isLoading: false,
            });
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH, {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});
        });
}

/**
 * Returns the airline's full fare rule text for a fare from a flight search
 */
function getFlightFareRules(policyID: string, searchID: string, fareID: string): Promise<FlightFareRules[]> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method -- the full rule text is only shown on the fare rules screen that requests it, so it is not stored in Onyx
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_FLIGHT_FARE_RULES, {policyID, searchID, fareID}).then((response) => response?.fareRules ?? []);
}

/**
 * Starts checkout for the fare picked on the last leg of the search, replacing travelFlightCheckout
 */
function startFlightCheckout(policyID: string, searchID: string, fareID: string) {
    Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT, {policyID, searchID, fareID, isLoading: true});

    // eslint-disable-next-line rulesdir/no-api-side-effects-method -- the server returns the checkout instead of writing Onyx, so it is stored here
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.START_FLIGHT_CHECKOUT, {policyID, searchID, fareID})
        .then((response) => {
            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                throw new Error(response?.message ?? 'Flight checkout failed');
            }
            Onyx.merge(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT, {
                checkoutResponseID: response.checkoutResponseID,
                seatMapResponseID: response.seatMapResponseID,
                itinerary: response.itinerary,
                priceSummary: response.priceSummary,
                requiredTravelerFields: response.requiredTravelerFields,
                seatMaps: response.seatMaps,
                selectedSeats: {},
                paymentSources: response.paymentSources,
                isLoading: false,
            });
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT, {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});
        });
}

/**
 * Clears the flight search and checkout when the traveler leaves the booking flow
 */
function clearFlightBooking() {
    Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH, null);
    Onyx.set(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT, null);
}

function cleanupTravelProvisioningSession() {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

export {
    acceptSpotnanaTerms,
    cleanupTravelProvisioningSession,
    clearFlightBooking,
    getFlightFareRules,
    searchFlights,
    searchTravelAirports,
    startFlightCheckout,
    requestTravelAccess,
    setTravelProvisioningDomain,
    setTravelProvisioningEnabledSteps,
    setTravelProvisioningNextStep,
    setTravelProvisioningTaxID,
};
