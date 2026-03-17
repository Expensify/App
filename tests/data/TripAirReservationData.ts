/* cspell:disable */
import type {Pnr, PnrTraveler} from '@src/types/onyx/TripData';

/**
 * Minimal PNR data for a round-trip flight.
 * This is used to test that getAirReservations correctly parses and sorts flight legs.
 * It contains only the fields accessed by the function.
 */
const airReservationPnrData: Pnr = {
    pnrId: 'PNR12345',
    data: {
        additionalMetadata: {
            airlineInfo: [{airlineCode: 'UA', airlineName: 'United Airlines'}],
            airportInfo: [
                //
                {
                    airportCode: 'DEN',
                    airportName: 'Denver Intl',
                    cityName: 'Denver',
                    stateCode: 'CO',
                    countryName: 'USA',
                    countryCode: '',
                    zoneName: '',
                },
                {
                    airportCode: 'SFO',
                    airportName: 'San Francisco Intl',
                    cityName: 'San Francisco',
                    stateCode: 'CA',
                    countryName: 'USA',
                    countryCode: '',
                    zoneName: '',
                },
            ],
        },
        airPnr: {
            legs: [
                // Leg 0: DEN -> SFO (Outbound)
                {
                    legIndex: 0,
                    flights: [
                        {
                            origin: 'DEN',
                            destination: 'SFO',
                            departureDateTime: {iso8601: '2026-01-25T10:08:00Z'},
                            arrivalDateTime: {iso8601: '2026-01-25T11:58:00Z'},
                            marketing: {airlineCode: 'UA', num: '2041'},
                            vendorConfirmationNumber: 'CONF123',
                            cabin: 'Economy',
                            duration: {iso8601: 'PT2H50M'},
                            arrivalGate: {gate: 'F1', terminal: '3'},
                            amenities: [],
                            bookingCode: '',
                            co2EmissionDetail: {
                                averageEmissionValue: 0,
                                emissionValue: 0,
                                flightDistanceKm: 0,
                                isApproximate: false,
                            },
                            departureGate: {
                                gate: '',
                                terminal: '',
                            },
                            distance: {
                                length: 0,
                                unit: '',
                            },
                            equipment: {
                                code: '',
                                name: '',
                                type: '',
                            },
                            flightId: '',
                            flightIndex: 0,
                            flightStatus: '',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            operating: {
                                airlineCode: '',
                                num: '',
                            },
                            operatingAirlineName: '',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: '',
                        },
                    ],
                    brandName: '',
                    fareOffers: [],
                    legId: '',
                    legStatus: '',
                    preferences: [],
                    preferredTypes: [],
                    rateType: '',
                    sortingPriority: 0,
                    travelerRestrictions: [],
                    validatingAirlineCode: '',
                },
                // Leg 1: SFO -> DEN (Return)
                {
                    legIndex: 1,
                    flights: [
                        {
                            origin: 'SFO',
                            destination: 'DEN',
                            departureDateTime: {iso8601: '2026-01-31T16:31:00Z'},
                            arrivalDateTime: {iso8601: '2026-01-31T20:12:00Z'},
                            marketing: {airlineCode: 'UA', num: '1430'},
                            vendorConfirmationNumber: 'CONF123', // Can be the same for the PNR
                            cabin: 'Economy',
                            duration: {iso8601: 'PT2H41M'},
                            arrivalGate: {gate: 'B2', terminal: '1'},
                            amenities: [],
                            bookingCode: '',
                            co2EmissionDetail: {
                                averageEmissionValue: 0,
                                emissionValue: 0,
                                flightDistanceKm: 0,
                                isApproximate: false,
                            },
                            departureGate: {
                                gate: '',
                                terminal: '',
                            },
                            distance: {
                                length: 0,
                                unit: '',
                            },
                            equipment: {
                                code: '',
                                name: '',
                                type: '',
                            },
                            flightId: '',
                            flightIndex: 0,
                            flightStatus: '',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            operating: {
                                airlineCode: '',
                                num: '',
                            },
                            operatingAirlineName: '',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: '',
                        },
                    ],
                    brandName: '',
                    fareOffers: [],
                    legId: '',
                    legStatus: '',
                    preferences: [],
                    preferredTypes: [],
                    rateType: '',
                    sortingPriority: 0,
                    travelerRestrictions: [],
                    validatingAirlineCode: '',
                },
            ],
            travelerInfos: [
                {
                    userId: {id: 'traveler_1'},
                    booking: {
                        // The getSeatByLegAndFlight helper function looks for this.
                        seats: [
                            {
                                legIdx: 0,
                                flightIdx: 0,
                                number: '12A',
                                amount: 0,
                            },
                        ],
                        itinerary: {
                            fareComponents: [],
                            flightFareBreakup: [],
                            otherAncillaryFares: [],
                            totalFare: {
                                base: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                            },
                            totalFlightsFare: {
                                base: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                            },
                        },
                        luggageDetails: [],
                        otherAncillaries: [],
                        otherCharges: [],
                    },
                    tickets: [
                        {
                            // The function iterates through these coupons to build the reservation list.
                            // The order here is intentionally mixed to ensure the function correctly sorts by legIdx.
                            flightCoupons: [
                                {legIdx: 1, flightIdx: 0, status: 'NOT_FLOWN'},
                                {legIdx: 0, flightIdx: 0, status: 'NOT_FLOWN'},
                            ],
                            amount: {
                                base: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                            },
                            ancillaries: [],
                            commission: {
                                amount: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                                percent: 0,
                            },
                            conjunctionTicketSuffix: [],
                            exchangePolicy: {
                                exchangePenalty: undefined,
                                isCat16: false,
                                isConditional: false,
                                isExchangeable: false,
                            },
                            fareCalculation: '',
                            iataNumber: '',
                            issuedDateTime: {
                                iso8601: '',
                            },
                            paymentDetails: [],
                            pcc: '',
                            publishedFare: {
                                base: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: '',
                                    currencyCode: '',
                                    otherCoinage: [],
                                },
                            },
                            refundPolicy: {
                                isCat16: false,
                                isConditional: false,
                                isRefundable: false,
                                isRefundableByObt: false,
                            },
                            status: '',
                            taxBreakdown: {
                                tax: [],
                            },
                            ticketIncompleteReasons: [],
                            ticketNumber: '',
                            ticketSettlement: '',
                            ticketType: '',
                            validatingAirlineCode: '',
                            vendorCancellationId: '',
                        },
                    ],
                    airVendorCancellationInfo: {
                        airVendorCancellationObjects: [],
                    },
                    appliedCredits: [],
                    boardingPass: [],
                    paxType: '',
                    specialServiceRequestInfos: [],
                    travelerIdx: 0,
                },
            ],
            airPnrRemarks: [],
            automatedCancellationInfo: {
                supportedCancellations: [],
            },
            automatedExchangeInfo: {
                supportedExchanges: [],
            },
            bookingMetadata: {
                fareStatistics: {
                    statisticsItems: [],
                },
            },
            otherServiceInfos: [],
            holdDeadline: {
                holdDeadline: {},
            },
            airPriceOptimizationMetadata: {
                oldTickets: [],
                newTickets: [],
                oldPnrId: '',
                newPnrId: '',
                oldPrice: {
                    otherCoinage: [],
                },
                newPrice: {
                    otherCoinage: [],
                },
                priceDrop: {
                    otherCoinage: [],
                },
                penaltyPrice: {
                    otherCoinage: [],
                },
            },
            disruptedFlightDetails: [],
        },
        version: 0,
        travelers: [],
        pnrTravelers: [],
        transactions: [],
        customFields: [],
        tripId: '',
        suspendReason: '',
        totalFareAmount: {
            base: {
                amount: 0,
                convertedAmount: 0,
                convertedCurrency: '',
                currencyCode: '',
            },
            tax: {
                amount: 0,
            },
        },
    },
};

/**
 * Minimal traveler data corresponding to the PNR above.
 * This is used by the `findTravelerInfo` helper within the test subject.
 */
const airReservationTravelers: PnrTraveler[] = [
    {
        // This ID must match a userId in the travelerInfos array within the PNR data.
        userId: {id: 'traveler_1'},
        personalInfo: {
            name: {
                family1: 'Doe',
                given: 'John',
                family2: '',
                middle: '',
                preferred: '',
            },
            email: 'john.doe@example.com',
            addresses: [],
            phoneNumbers: [],
        },
        travelerInfo: {},
        loyalties: [],
        persona: '',
        businessInfo: {
            companySpecifiedAttributes: [],
        },
        tier: '',
    },
];

export {airReservationPnrData, airReservationTravelers};
