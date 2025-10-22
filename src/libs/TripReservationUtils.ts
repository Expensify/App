/* cspell:disable */
import {getAirReservations, getPNRReservationDataFromTripReport, getReservationsFromTripReport} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import type {Pnr, PnrTraveler, TripData} from '@src/types/onyx/TripData';
import {createRandomReport} from '../utils/collections/reports';

const basicTripData: TripData = {
    pnrs: [],
    tripPaymentInfo: {
        totalFare: {
            amount: 1000,
            currencyCode: 'USD',
        },
    },
};

// PNR data for all types
const airPnrDirect: Pnr = {
    pnrId: 'PNR_AIR_789',
    data: {
        airPnr: {
            legs: [
                {
                    flights: [
                        {
                            origin: 'ORD',
                            destination: 'SFO',
                            departureDateTime: {iso8601: '2023-10-02T07:00:00Z'},
                            arrivalDateTime: {iso8601: '2023-10-02T10:00:00Z'},
                            marketing: {airlineCode: 'UA', num: '456'},
                            vendorConfirmationNumber: 'CONF123',
                            cabin: 'Economy',
                            duration: {iso8601: 'PT3H'},
                            amenities: [],
                            arrivalGate: {
                                gate: 'A12',
                                terminal: '1',
                            },
                            bookingCode: '',
                            co2EmissionDetail: {
                                averageEmissionValue: 0,
                                emissionValue: 0,
                                flightDistanceKm: 0,
                                isApproximate: false,
                            },
                            departureGate: {
                                gate: 'B5',
                                terminal: '3',
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
                    legIndex: 0,
                    legStatus: '',
                    preferences: [],
                    preferredTypes: [],
                    rateType: '',
                    sortingPriority: 0,
                    travelerRestrictions: [],
                    validatingAirlineCode: '',
                },
            ],
            airPnrRemarks: [],
            travelerInfos: [
                {
                    tickets: [
                        {
                            flightCoupons: [
                                {
                                    legIdx: 0,
                                    flightIdx: 0,
                                    status: 'CONFIRMED',
                                },
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
                    booking: {
                        seats: [
                            {
                                legIdx: 0,
                                flightIdx: 0,
                                amount: 0,
                                number: 0,
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
                    userId: {id: 'user123'},
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
        pnrTravelers: [
            {
                userId: {id: 'user123'},
                personalInfo: {
                    name: {family1: 'Doe', given: 'John', middle: '', family2: '', preferred: ''},
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
        ],
        additionalMetadata: {
            airportInfo: [
                {
                    airportCode: 'ORD',
                    airportName: "O'Hare International Airport",
                    cityName: 'Chicago',
                    stateCode: 'IL',
                    countryName: 'USA',
                    countryCode: '',
                    zoneName: '',
                },
                {
                    airportCode: 'SFO',
                    airportName: 'San Francisco International Airport',
                    cityName: 'San Francisco',
                    stateCode: 'CA',
                    countryName: 'USA',
                    countryCode: '',
                    zoneName: '',
                },
            ],
            airlineInfo: [{airlineCode: 'UA', airlineName: 'United Airlines'}],
        },
        version: 0,
        travelers: [],
        transactions: [],
        customFields: [],
        tripId: '',
        suspendReason: '',
        totalFareAmount: {
            base: {
                amount: 50,
                convertedAmount: 0,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
            tax: {
                amount: 5,
            },
        },
    },
};

// airPnrConnecting
const airPnrConnecting: Pnr = {
    pnrId: 'PNR_AIR_CONNECTING_789',
    data: {
        additionalMetadata: {
            airlineInfo: [
                {
                    airlineCode: 'AS',
                    airlineName: 'Alaska Airlines, Inc.',
                },
                {
                    airlineCode: 'DL',
                    airlineName: 'Delta Air Lines',
                },
                {
                    airlineCode: 'HA',
                    airlineName: 'Hawaiian Airlines',
                },
            ],
            airportInfo: [
                {
                    airportCode: 'EWR',
                    airportName: 'Newark Liberty International Airport',
                    cityName: 'Newark',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'NJ',
                    zoneName: 'America/New_York',
                },
                {
                    airportCode: 'LAX',
                    airportName: 'Los Angeles International Airport',
                    cityName: 'Los Angeles',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'CA',
                    zoneName: 'America/Los_Angeles',
                },
                {
                    airportCode: 'MSP',
                    airportName: 'Minneapolis–Saint Paul International Airport',
                    cityName: 'Minneapolis / St Paul',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'MN',
                    zoneName: 'America/Chicago',
                },
            ],
        },
        airPnr: {
            airPnrRemarks: [
                {
                    remarkString: 'TRIPID 1668558857',
                },
                {
                    remarkString: '*VI4XXXXXXXXXXX1111¥06/28-XN',
                },
                {
                    remarkString: 'OBT-COMMISSION-SUCCESS-1749391712',
                },
                {
                    remarkString: 'OBT-COMMISSION-PROCESSED-1749391712',
                },
                {
                    remarkString: 'AUTH-FDCVI/VI1111/08JUN/01301749391725124825      ',
                },
                {
                    remarkString: 'LOCALITY US 94104',
                },
                {
                    remarkString: 'PNRTYPE AIR',
                },
                {
                    remarkString: 'XXTAW/',
                },
                {
                    remarkString: 'TRAVELERPID B582F8FB-F789-4C65-BED2-35DC5B5F1AB1',
                },
                {
                    remarkString: 'ENVIRONMENT SBOXMETA',
                },
                {
                    remarkString: 'ISPASSIVEPNR FALSE',
                },
                {
                    remarkString: 'PPT DOB-06/16/1995 THOMAS/HENRY -M',
                },
                {
                    remarkString: '548 MARKET STREET',
                },
                {
                    remarkString: 'XXAUTH/OK4712/VI4XXXXXXXXXXX1111/HA/USD399.30/08JUN/S',
                },
                {
                    remarkString: 'NO-COMMISSION-APPLIES-1749391712',
                },
                {
                    remarkString: 'S*UD78 IN POLICY',
                },
                {
                    remarkString: 'S*SA804',
                },
                {
                    remarkString: 'WORKFLOWID B75543BBCBB532E2',
                },
                {
                    remarkString: '2-SABREPROFILES¥TEST TRAVEL EXTERNAL  314C5F5ACA7EABBE',
                },
                {
                    remarkString: 'TRACEID 74315AECEB21304A',
                },
                {
                    remarkString: 'BOOKEDBYORGID 3C75046B-6956-4C7D-9FD5-E8C3A29EEFBD',
                },
                {
                    remarkString: 'TEST TRAVEL EXTERNAL - 314C5F5ACA7EABBE',
                },
                {
                    remarkString: 'PNRID 8946836323',
                },
                {
                    remarkString: '  AUTH-UNKNOWN CSC RESULT CODE/                   ',
                },
                {
                    remarkString: 'AUTH-FDCVI/VI1111/08JUN/01951749391730474609      ',
                },
                {
                    remarkString: 'NO EMAIL',
                },
                {
                    remarkString: 'S*UD166 SPOTNANA',
                },
                {
                    remarkString: 'S*UD212 TEST TRAVEL EXTERNAL  314C5F5ACA7EABBE',
                },
                {
                    remarkString: 'AIR-SEQ1',
                },
                {
                    remarkString: 'BOOKEDBYUSERID B582F8FB-F789-4C65-BED2-35DC5B5F1AB1',
                },
                {
                    remarkString: 'TRAVELERORGID 3C75046B-6956-4C7D-9FD5-E8C3A29EEFBD',
                },
                {
                    remarkString: 'S*UD3 1668558857',
                },
                {
                    remarkString: '  AUTH-APV/OK4712/000/USD399.30                   ',
                },
                {
                    remarkString: '  AUTH-APV/OK4752/000/USD409.18                   ',
                },
                {
                    remarkString: 'XXAUTH/OK4752/VI4XXXXXXXXXXX1111/DL/USD409.18/08JUN/S',
                },
                {
                    remarkString: '  AUTH-AVS NOT SUPPLIED BY MERCHANT/J             ',
                },
            ],
            automatedCancellationInfo: {
                supportedCancellations: [
                    {
                        cancelType: 'VOID',
                        maxCancellationDateTime: {
                            iso8601: '2025-06-08T22:59:00Z',
                        },
                        refund: {
                            amount: 808.48,
                            convertedAmount: 808.48,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                            otherCoinage: [],
                        },
                        totalFare: {
                            base: {
                                amount: 714.59,
                                convertedAmount: 714.59,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                            tax: {
                                amount: 93.89,
                                convertedAmount: 93.89,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                        },
                    },
                ],
            },
            automatedExchangeInfo: {
                supportedExchanges: [
                    {
                        legInfos: [
                            {
                                legIdx: 0,
                            },
                        ],
                    },
                ],
            },
            bookingMetadata: {
                fareStatistics: {
                    statisticsItems: [
                        {
                            statisticType: 'MINIMUM',
                            totalFare: {
                                base: {
                                    amount: 714.42,
                                    convertedAmount: 714.42,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 83.78,
                                    convertedAmount: 83.78,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MEDIAN',
                            totalFare: {
                                base: {
                                    amount: 723.89,
                                    convertedAmount: 723.89,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 94.59,
                                    convertedAmount: 94.59,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MAXIMUM',
                            totalFare: {
                                base: {
                                    amount: 913.66,
                                    convertedAmount: 913.66,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 108.82,
                                    convertedAmount: 108.82,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                    ],
                },
            },
            disruptedFlightDetails: [
                {
                    arrivalDateTime: {
                        iso8601: '2025-06-09T05:04:00',
                    },
                    cabin: 'ECONOMY',
                    departureDateTime: {
                        iso8601: '2025-06-08T23:30:00',
                    },
                    destinationAirportCode: 'MSP',
                    marketing: {
                        num: '0430',
                    },
                    operating: {
                        num: '0430',
                    },
                    originAirportCode: 'LAX',
                },
                {
                    arrivalDateTime: {
                        iso8601: '2025-06-09T11:36:00',
                    },
                    cabin: 'ECONOMY',
                    departureDateTime: {
                        iso8601: '2025-06-09T07:58:00',
                    },
                    destinationAirportCode: 'EWR',
                    marketing: {
                        num: '2864',
                    },
                    operating: {
                        num: '2864',
                    },
                    originAirportCode: 'MSP',
                },
                {
                    arrivalDateTime: {
                        iso8601: '2025-06-08T22:59:00',
                    },
                    cabin: 'ECONOMY',
                    departureDateTime: {
                        iso8601: '2025-06-08T19:59:00',
                    },
                    destinationAirportCode: 'LAX',
                    marketing: {
                        num: '4895',
                    },
                    operating: {
                        num: '0287',
                    },
                    originAirportCode: 'EWR',
                },
            ],
            legs: [
                {
                    brandName: 'Delta Main',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        description: '1 carry-on bag',
                                    },
                                ],
                                checkedIn: [
                                    {
                                        description: '1 checked bag, 23 kgs (35 USD)',
                                    },
                                ],
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'Non-refundable',
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'Change allowed for free',
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [[], [], [], [], [], [], [], []],
                            arrivalDateTime: {
                                iso8601: '2025-06-09T05:04:00',
                            },
                            arrivalGate: {
                                gate: '1',
                                terminal: 'TERMINAL 1 - LINDBERGH',
                            },
                            bookingCode: 'Q',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.286,
                                emissionValue: 0.25168,
                                flightDistanceKm: 2566,
                                isApproximate: false,
                            },
                            departureDateTime: {
                                iso8601: '2025-06-08T23:30:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: 'TERMINAL 3',
                            },
                            destination: 'MSP',
                            distance: {
                                length: 1536,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT3H45M',
                            },
                            equipment: {
                                code: '32Q',
                                name: 'Airbus A321neo',
                                type: '',
                            },
                            flightId: 'CgNMQVgSA01TUBoVChMyMDI1LTA2LTA4VDIzOjMwOjAwIhUKEzIwMjUtMDYtMDlUMDU6MDQ6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'DL',
                                num: '430',
                            },
                            operating: {
                                airlineCode: 'DL',
                                num: '430',
                            },
                            operatingAirlineName: '',
                            origin: 'LAX',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            vendorConfirmationNumber: 'G9Z6EX',
                        },
                        {
                            amenities: [],
                            arrivalDateTime: {
                                iso8601: '2025-06-09T11:36:00',
                            },
                            arrivalGate: {
                                gate: 'A',
                                terminal: 'TERMINAL A',
                            },
                            bookingCode: 'Q',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.22792116816,
                                emissionValue: 0.22792116816,
                                flightDistanceKm: 1622.21472,
                                isApproximate: true,
                            },
                            departureDateTime: {
                                iso8601: '2025-06-09T07:58:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: 'TERMINAL 1 - LINDBERGH',
                            },
                            destination: 'EWR',
                            distance: {
                                length: 1004,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT2H39M',
                            },
                            equipment: {
                                code: '319',
                                name: 'Airbus A319',
                                type: '',
                            },
                            flightId: 'CgNNU1ASA0VXUhoVChMyMDI1LTA2LTA5VDA3OjU4OjAwIhUKEzIwMjUtMDYtMDlUMTE6MzY6MDA=',
                            flightIndex: 1,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'DL',
                                num: '2864',
                            },
                            operating: {
                                airlineCode: 'DL',
                                num: '2864',
                            },
                            operatingAirlineName: '',
                            origin: 'MSP',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            vendorConfirmationNumber: 'G9Z6EX',
                        },
                    ],
                    legId: 'CgNMQVgSA0VXUhoKODk0NjgzNjMyMw==',
                    legIndex: 0,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 1,
                    travelerRestrictions: [],
                    validatingAirlineCode: 'DL',
                },
                {
                    brandName: 'Main Cabin Basic',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        description: '1 carry-on bag',
                                    },
                                ],
                                checkedIn: [
                                    {
                                        description: '1 checked bag, 23 kgs (35 USD)',
                                    },
                                    {
                                        description: '+1 checked bag, 23 kgs (45 USD)',
                                    },
                                ],
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'Non-refundable',
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'Changes not allowed',
                            },
                            userId: {
                                id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [[], [], [], [], [], [], [], []],
                            arrivalDateTime: {
                                iso8601: '2025-06-08T22:59:00',
                            },
                            arrivalGate: {
                                gate: '6',
                                terminal: 'TERMINAL 6',
                            },
                            bookingCode: 'U',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.55487951058,
                                emissionValue: 0.55487951058,
                                flightDistanceKm: 3949.32036,
                                isApproximate: true,
                            },
                            departureDateTime: {
                                iso8601: '2025-06-08T19:59:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: 'TERMINAL B',
                            },
                            destination: 'LAX',
                            distance: {
                                length: 2453,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT6H',
                            },
                            equipment: {
                                code: '737',
                                name: '',
                                type: '',
                            },
                            flightId: 'CgNFV1ISA0xBWBoVChMyMDI1LTA2LTA4VDE5OjU5OjAwIhUKEzIwMjUtMDYtMDhUMjI6NTk6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'HA',
                                num: '4895',
                            },
                            operating: {
                                airlineCode: 'AS',
                                num: '287',
                            },
                            operatingAirlineName: '',
                            origin: 'EWR',
                            otherStatuses: [],
                            restrictions: ['SEAT_BOOKING_NOT_ALLOWED_DUE_TO_CODESHARE'],
                            sourceStatus: 'HK',
                            vendorConfirmationNumber: 'AJ4ICZ',
                        },
                    ],
                    legId: 'CgNFV1ISA0xBWBoKODk0NjgzNjMyMw==',
                    legIndex: 1,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 0,
                    travelerRestrictions: [],
                    validatingAirlineCode: 'HA',
                },
            ],
            otherServiceInfos: [],
            travelerInfos: [
                {
                    airVendorCancellationInfo: {
                        airVendorCancellationObjects: [],
                    },
                    appliedCredits: [],
                    boardingPass: [],
                    booking: {
                        itinerary: {
                            fareComponents: [
                                {
                                    baseFare: {
                                        amount: 357.21,
                                        convertedAmount: 357.21,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    fareBasisCode: 'QA0NA0MQ',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 0,
                                        },
                                        {
                                            flightIdx: 1,
                                            legIdx: 0,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: '',
                                },
                                {
                                    baseFare: {
                                        amount: 357.21,
                                        convertedAmount: 357.21,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    fareBasisCode: 'MH0OAVBN',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 1,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: '',
                                },
                            ],
                            flightFareBreakup: [
                                {
                                    flightsFare: {
                                        base: {
                                            amount: 357.38,
                                            convertedAmount: 357.38,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 51.8,
                                            convertedAmount: 51.8,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    legIndices: [0],
                                },
                                {
                                    flightsFare: {
                                        base: {
                                            amount: 357.21,
                                            convertedAmount: 357.21,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 42.09,
                                            convertedAmount: 42.09,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    legIndices: [1],
                                },
                            ],
                            otherAncillaryFares: [],
                            totalFare: {
                                base: {
                                    amount: 714.59,
                                    convertedAmount: 714.59,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 93.89,
                                    convertedAmount: 93.89,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            totalFlightsFare: {
                                base: {
                                    amount: 714.59,
                                    convertedAmount: 714.59,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 93.89,
                                    convertedAmount: 93.89,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                        },
                        luggageDetails: [],
                        otherAncillaries: [],
                        otherCharges: [],
                        seats: [],
                    },
                    paxType: 'ADULT',
                    specialServiceRequestInfos: [],
                    tickets: [
                        {
                            amount: {
                                base: {
                                    amount: 357.38,
                                    convertedAmount: 357.38,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 51.8,
                                    convertedAmount: 51.8,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            ancillaries: [],
                            commission: {
                                amount: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                percent: 0,
                            },
                            conjunctionTicketSuffix: [],
                            exchangePolicy: {
                                exchangePenalty: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                isCat16: false,
                                isConditional: true,
                                isExchangeable: true,
                            },
                            fareCalculation: 'LAX DL X/MSP DL EWR Q LAXEWR0.17 357.21USD357.38END ZPLAXMSP XFLAX4.5MSP4.5',
                            flightCoupons: [
                                {
                                    flightIdx: 0,
                                    legIdx: 0,
                                    status: 'NOT_FLOWN',
                                },
                                {
                                    flightIdx: 1,
                                    legIdx: 0,
                                    status: 'NOT_FLOWN',
                                },
                            ],
                            iataNumber: '45526666',
                            issuedDateTime: {
                                iso8601: '2025-06-08T09:08:00',
                            },
                            paymentDetails: [
                                {
                                    amount: {
                                        base: {
                                            amount: 357.38,
                                            convertedAmount: 357.38,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 51.8,
                                            convertedAmount: 51.8,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    fop: {
                                        accessType: {
                                            accessType: 'PERSONAL',
                                            entities: [
                                                {
                                                    centralCardAccessLevel: 'UNKNOWN',
                                                    entityId: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                                                },
                                            ],
                                            entityIds: ['b582f8fb-f789-4c65-bed2-35dc5b5f1ab1'],
                                        },
                                        additionalInfo: '',
                                        card: {
                                            address: {
                                                addressLines: ['12222'],
                                                administrativeArea: '',
                                                administrativeAreaName: '',
                                                continentCode: '',
                                                description: '',
                                                isDefault: false,
                                                languageCode: '',
                                                locality: '',
                                                locationCode: '',
                                                organization: '',
                                                postalCode: '07008',
                                                recipients: [],
                                                regionCode: 'US',
                                                regionName: '',
                                                revision: 0,
                                                sortingCode: '',
                                                sublocality: '',
                                                timezone: '',
                                            },
                                            company: 'VISA',
                                            currency: '',
                                            cvv: '',
                                            expiryMonth: 6,
                                            expiryYear: 2028,
                                            externalId: '',
                                            id: 'cbe5defc-099a-4ed3-b42e-616138607289',
                                            label: 'AF',
                                            name: 'AF',
                                            number: '4XXXXXXXXXXX1111',
                                            type: 'CREDIT',
                                        },
                                        paymentMethod: 'CREDIT_CARD',
                                        type: 'CARD',
                                    },
                                    isRefunded: false,
                                },
                            ],
                            pcc: 'LA5K',
                            publishedFare: {
                                base: {
                                    amount: 357.38,
                                    convertedAmount: 357.38,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 51.8,
                                    convertedAmount: 51.8,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            refundPolicy: {
                                isCat16: false,
                                isConditional: false,
                                isRefundable: false,
                                isRefundableByObt: false,
                            },
                            status: 'ISSUED',
                            taxBreakdown: {
                                tax: [
                                    {
                                        amount: {
                                            amount: 10.4,
                                            convertedAmount: 10.4,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'ZP',
                                    },
                                    {
                                        amount: {
                                            amount: 5.6,
                                            convertedAmount: 5.6,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'AY',
                                    },
                                    {
                                        amount: {
                                            amount: 26.8,
                                            convertedAmount: 26.8,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'US',
                                    },
                                    {
                                        amount: {
                                            amount: 9,
                                            convertedAmount: 9,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'XF',
                                    },
                                ],
                            },
                            ticketIncompleteReasons: [],
                            ticketNumber: '0067174822201',
                            ticketSettlement: 'ARC_TICKET',
                            ticketType: 'FLIGHT',
                            validatingAirlineCode: 'DL',
                            vendorCancellationId: '',
                        },
                        {
                            amount: {
                                base: {
                                    amount: 357.21,
                                    convertedAmount: 357.21,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 42.09,
                                    convertedAmount: 42.09,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            ancillaries: [],
                            commission: {
                                amount: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                percent: 0,
                            },
                            conjunctionTicketSuffix: [],
                            exchangePolicy: {
                                isCat16: false,
                                isConditional: false,
                                isExchangeable: false,
                            },
                            fareCalculation: 'EWR HA LAX357.21USD357.21END ZPEWR XFEWR4.5',
                            flightCoupons: [
                                {
                                    flightIdx: 0,
                                    legIdx: 1,
                                    status: 'NOT_FLOWN',
                                },
                            ],
                            iataNumber: '45526666',
                            issuedDateTime: {
                                iso8601: '2025-06-08T09:08:00',
                            },
                            paymentDetails: [
                                {
                                    amount: {
                                        base: {
                                            amount: 357.21,
                                            convertedAmount: 357.21,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 42.09,
                                            convertedAmount: 42.09,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    fop: {
                                        accessType: {
                                            accessType: 'PERSONAL',
                                            entities: [
                                                {
                                                    centralCardAccessLevel: 'UNKNOWN',
                                                    entityId: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                                                },
                                            ],
                                            entityIds: ['b582f8fb-f789-4c65-bed2-35dc5b5f1ab1'],
                                        },
                                        additionalInfo: '',
                                        card: {
                                            address: {
                                                addressLines: ['12222'],
                                                administrativeArea: '',
                                                administrativeAreaName: '',
                                                continentCode: '',
                                                description: '',
                                                isDefault: false,
                                                languageCode: '',
                                                locality: '',
                                                locationCode: '',
                                                organization: '',
                                                postalCode: '07008',
                                                recipients: [],
                                                regionCode: 'US',
                                                regionName: '',
                                                revision: 0,
                                                sortingCode: '',
                                                sublocality: '',
                                                timezone: '',
                                            },
                                            company: 'VISA',
                                            currency: '',
                                            cvv: '',
                                            expiryMonth: 6,
                                            expiryYear: 2028,
                                            externalId: '',
                                            id: 'cbe5defc-099a-4ed3-b42e-616138607289',
                                            label: 'AF',
                                            name: 'AF',
                                            number: '4XXXXXXXXXXX1111',
                                            type: 'CREDIT',
                                        },
                                        paymentMethod: 'CREDIT_CARD',
                                        type: 'CARD',
                                    },
                                    isRefunded: false,
                                },
                            ],
                            pcc: 'LA5K',
                            publishedFare: {
                                base: {
                                    amount: 357.21,
                                    convertedAmount: 357.21,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 42.09,
                                    convertedAmount: 42.09,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            refundPolicy: {
                                isCat16: false,
                                isConditional: false,
                                isRefundable: false,
                                isRefundableByObt: false,
                            },
                            status: 'ISSUED',
                            taxBreakdown: {
                                tax: [
                                    {
                                        amount: {
                                            amount: 5.2,
                                            convertedAmount: 5.2,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'ZP',
                                    },
                                    {
                                        amount: {
                                            amount: 5.6,
                                            convertedAmount: 5.6,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'AY',
                                    },
                                    {
                                        amount: {
                                            amount: 26.79,
                                            convertedAmount: 26.79,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'US',
                                    },
                                    {
                                        amount: {
                                            amount: 4.5,
                                            convertedAmount: 4.5,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'XF',
                                    },
                                ],
                            },
                            ticketIncompleteReasons: [],
                            ticketNumber: '1737174822200',
                            ticketSettlement: 'ARC_TICKET',
                            ticketType: 'FLIGHT',
                            validatingAirlineCode: 'HA',
                            vendorCancellationId: '',
                        },
                    ],
                    travelerIdx: 0,
                    userId: {
                        id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                    },
                },
            ],
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
            holdDeadline: {
                holdDeadline: {},
            },
        },
        customFields: [],
        pnrTravelers: [
            {
                loyalties: [],
                persona: 'EMPLOYEE',
                personalInfo: {
                    email: 'toiyeucuocsong99+50@gmail.com',
                    name: {
                        family1: 'Thomas',
                        family2: '',
                        given: 'Henry',
                        middle: '',
                        preferred: '',
                    },
                    phoneNumbers: [
                        {
                            countryCode: 1,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: 'US',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '5615557689',
                            type: 'MOBILE',
                        },
                    ],
                    addresses: [],
                },
                tier: 'BASIC',
                travelerInfo: {
                    adhocTravelerInfo: [],
                    userId: {
                        id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                    },
                },
                userId: {
                    id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                },
                businessInfo: {
                    companySpecifiedAttributes: [],
                },
            },
        ],
        totalFareAmount: {
            base: {
                amount: 714.59,
                convertedAmount: 714.59,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
            tax: {
                amount: 93.89,
            },
        },
        travelers: [
            {
                isActive: true,
                persona: 'EMPLOYEE',
                tier: 'BASIC',
                user: {
                    paymentInfos: [
                        {
                            access: {
                                accessType: 'PERSONAL',
                                entities: [
                                    {
                                        centralCardAccessLevel: 'UNKNOWN',
                                        entityId: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                                    },
                                ],
                                entityIds: ['b582f8fb-f789-4c65-bed2-35dc5b5f1ab1'],
                            },
                            accessType: 'PERSONAL',
                            applicableTo: [],
                            card: {
                                address: {
                                    addressLines: ['12222'],
                                    postalCode: '07008',
                                    regionCode: 'US',
                                },
                                company: 'VISA',
                                cvv: '',
                                expiryMonth: 6,
                                expiryYear: 2028,
                                id: 'cbe5defc-099a-4ed3-b42e-616138607289',
                                label: 'AF',
                                name: 'AF',
                                number: '4XXXXXXXXXXX1111',
                                type: 'CREDIT',
                            },
                        },
                    ],
                    phoneNumbers: [
                        {
                            countryCode: 1,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: 'US',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '5615557689',
                            type: 'MOBILE',
                        },
                    ],
                    addresses: [],
                    identityDocs: [],
                },
                userOrgId: {
                    organizationAgencyId: {
                        id: '7a290c6e-5328-4107-aff6-e48765845b81',
                    },
                    organizationId: {
                        id: '3c75046b-6956-4c7d-9fd5-e8c3a29eefbd',
                    },
                    tmcBasicInfo: {
                        bookingTmc: {
                            id: {
                                id: '90a73426-82dc-4f37-bf5e-19b25b62e61e',
                            },
                        },
                        contractingTmc: {
                            id: {
                                id: '7a290c6e-5328-4107-aff6-e48765845b81',
                            },
                            logo: {
                                data: '',
                                dimensions: {
                                    height: 0,
                                    width: 0,
                                },
                                url: '',
                            },
                            name: 'Expensify',
                        },
                    },
                    tmcInfo: {
                        id: {
                            id: '90a73426-82dc-4f37-bf5e-19b25b62e61e',
                        },
                        partnerTmcId: {
                            id: '7a290c6e-5328-4107-aff6-e48765845b81',
                        },
                        primaryServiceProviderTmc: {
                            tmcId: {
                                id: '90a73426-82dc-4f37-bf5e-19b25b62e61e',
                            },
                        },
                        secondaryServiceProviderTmcs: [],
                    },
                    userId: {
                        id: 'b582f8fb-f789-4c65-bed2-35dc5b5f1ab1',
                    },
                },
                travelerPersonalInfo: {
                    loyaltyInfos: [],
                },
                userBusinessInfo: {
                    phoneNumbers: [],
                    designatedApproverInfos: [],
                    designatedApproverUserIds: [],
                },
                externalId: '',
                adhocUserInfo: {},
            },
        ],
        tripId: '1668558857',
        version: 10,
        transactions: [],
        suspendReason: '',
    },
};

const railPnr: Pnr = {
    pnrId: 'PNR_RAIL_789',
    data: {
        railPnr: {
            legInfos: [
                {
                    originInfo: {
                        name: 'Station X',
                        cityName: 'City X',
                        code: 'STX',
                        cityCode: '',
                        continentCode: '',
                        countryCode: '',
                        latLong: {
                            latitude: 0,
                            longitude: 0,
                        },
                        localCode: '',
                        sourceRefInfos: [],
                        stateCode: '',
                        stationType: '',
                        timeZone: '',
                    },
                    destinationInfo: {
                        name: 'Station Y',
                        cityName: 'City Y',
                        code: 'STY',
                        cityCode: '',
                        continentCode: '',
                        countryCode: '',
                        latLong: {
                            latitude: 0,
                            longitude: 0,
                        },
                        localCode: '',
                        sourceRefInfos: [],
                        stateCode: '',
                        stationType: '',
                        timeZone: '',
                    },
                    departAt: {iso8601: '2023-10-03T09:00:00Z'},
                    arriveAt: {iso8601: '2023-10-03T13:00:00Z'},
                    duration: {iso8601: 'PT4H'},
                    allocatedSpaces: [{seatNumber: '12A', coachNumber: 'C1'}],
                    vendorName: 'Amtrak',
                    vehicle: {
                        carrierName: 'Amtrak',
                        timetableId: '12345',
                        transportName: 'Train 123',
                        type: 'Train',
                    },
                    ticketNumber: 'RAIL12345',
                    amenities: [],
                    arriveAtLocal: {
                        iso8601: '',
                    },
                    carrierConfirmationNumber: '',
                    co2EmissionGramsPerPassenger: 0,
                    departAtLocal: {
                        iso8601: '',
                    },
                    destination: '',
                    distance: {
                        length: 0,
                        unit: '',
                    },
                    fareType: '',
                    legId: '',
                    origin: '',
                    railFareType: {
                        description: '',
                        fareDetails: [],
                        fareSummary: '',
                    },
                    seatPreferenceSelection: {
                        carriageType: '',
                        deckType: '',
                        direction: '',
                        facilities: [],
                        positionType: '',
                        seatLocationType: '',
                        seatType: '',
                    },
                    travelClass: '',
                    travelerRailInfo: [],
                },
            ],
            tickets: [
                {
                    passengerRefs: [0],
                    legs: [0],
                },
            ],
            passengerInfos: [
                {
                    userOrgId: {
                        userId: {id: 'user456'},
                        organizationId: {
                            id: '',
                        },
                    },
                    passengerType: '',
                },
            ],
            inwardJourney: {
                journeyStatus: '',
                legs: [],
                co2EmissionDetails: {},
                sortingPriority: 0,
                fareComposition: '',
                userFacingStatus: '',
            },
            outwardJourney: {
                journeyStatus: '',
                legs: [],
                co2EmissionDetails: {},
                sortingPriority: 0,
                fareComposition: '',
                userFacingStatus: '',
            },
            rate: {
                base: {
                    otherCoinage: [],
                },
                extras: [],
                refund: {
                    otherCoinage: [],
                },
                tax: {
                    otherCoinage: [],
                },
                commission: {},
                includesCommission: false,
                taxBreakdown: {
                    tax: [],
                },
                transactionDate: {},
                refundInfo: {},
            },
            rateMetadata: {
                negotiatedRateType: '',
                publishedRate: {},
                tmcNegotiatedRate: {},
                corporateNegotiatedRate: {},
            },
            paymentMode: '',
            sections: [],
            ticketDetails: [],
            type: '',
            vendorConfirmationNumber: '',
            itineraryId: '',
            ancillaries: [],
            termsAndConditions: {
                conditions: [],
            },
            exchangeInfo: {
                exchangeType: '',
                relatedSectionInfo: {
                    newSectionIndexes: [],
                    oldSectionIndexes: [],
                },
            },
            previousItinerary: {
                type: '',
                outwardJourney: {
                    legs: [],
                },
                inwardJourney: {
                    legs: [],
                },
                legInfos: [],
                sections: [],
                deliveryOption: '',
                sourceReference: '',
                rate: {
                    extras: [],
                    commission: {},
                    taxBreakdown: {},
                    refundInfo: {},
                },
            },
        },
        pnrTravelers: [
            {
                userId: {id: 'user456'},
                personalInfo: {
                    name: {family1: 'Smith', given: 'Alice', middle: '', family2: '', preferred: ''},
                    email: 'alice.smith@example.com',
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
        ],
        version: 0,
        travelers: [],
        transactions: [],
        additionalMetadata: {
            airportInfo: [],
            airlineInfo: [],
        },
        customFields: [],
        tripId: '',
        suspendReason: '',
        totalFareAmount: {
            base: {
                amount: 100,
                convertedAmount: 0,
                convertedCurrency: '',
                currencyCode: 'USD',
            },
            tax: {
                amount: 10,
            },
        },
    },
};

const carPnr: Pnr = {
    pnrId: 'PNR_CAR_789',
    data: {
        carPnr: {
            pickupDateTime: {iso8601: '2023-10-04T09:00:00Z'},
            dropOffDateTime: {iso8601: '2023-10-06T09:00:00Z'},
            carInfo: {
                vendor: {
                    name: 'Avis',
                    code: '',
                },
                carSpec: {displayName: 'SUV', engineType: 'Electric'},
                pickupLocation: {
                    address: {
                        addressLines: ['City Center'],
                        locality: 'Chicago',
                        administrativeArea: '',
                        administrativeAreaName: '',
                        continentCode: '',
                        description: '',
                        isDefault: false,
                        languageCode: '',
                        locationCode: '',
                        organization: '',
                        postalCode: '',
                        recipients: [],
                        regionCode: '',
                        regionName: '',
                        revision: 0,
                        sortingCode: '',
                        sublocality: '',
                        timezone: '',
                    },
                },
                dropOffLocation: {
                    address: {
                        addressLines: ['Airport'],
                        locality: 'Chicago',
                        administrativeArea: '',
                        administrativeAreaName: '',
                        continentCode: '',
                        description: '',
                        isDefault: false,
                        languageCode: '',
                        locationCode: '',
                        organization: '',
                        postalCode: '',
                        recipients: [],
                        regionCode: '',
                        regionName: '',
                        revision: 0,
                        sortingCode: '',
                        sublocality: '',
                        timezone: '',
                    },
                },
                mileageAllowance: {},
                carTypeCode: '',
                extraMileageCharge: {
                    otherCoinage: [],
                },
                preferredType: [],
                preferences: [],
                co2EmissionDetail: {},
            },
            vendorConfirmationNumber: 'CARCONF123',
            cancellationPolicy: {policy: 'Free cancellation up to 24 hours before pickup', deadline: {iso8601: '2023-10-03T09:00:00Z'}},
            paymentType: '',
            pnrStatus: '',
            rate: {
                base: {
                    otherCoinage: [],
                },
                extras: [],
                refund: {
                    otherCoinage: [],
                },
                tax: {
                    otherCoinage: [],
                },
                commission: {},
                includesCommission: false,
                taxBreakdown: {
                    tax: [],
                },
                transactionDate: {},
                refundInfo: {},
            },
            sortingPriority: 0,
            corporateId: '',
            rateType: '',
            sourceStatus: '',
            vendorCancellationId: '',
            originalCarSearchInfo: {
                pickup: {},
                dropOff: {},
            },
            rateMetadata: {
                negotiatedRateType: '',
                publishedRate: {},
                tmcNegotiatedRate: {},
                corporateNegotiatedRate: {},
            },
            rebookReference: {
                cancelledPnrIds: [],
                rebookedPnrId: '',
            },
            dailyRates: [],
        },
        pnrTravelers: [
            {
                personalInfo: {
                    name: {family1: 'Brown', given: 'Charlie', middle: '', family2: '', preferred: ''},
                    email: 'charlie.brown@example.com',
                    addresses: [],
                    phoneNumbers: [],
                },
                userId: {
                    id: '',
                },
                travelerInfo: {},
                loyalties: [],
                persona: '',
                businessInfo: {
                    companySpecifiedAttributes: [],
                },
                tier: '',
            },
        ],
        version: 0,
        travelers: [],
        transactions: [],
        additionalMetadata: {
            airportInfo: [],
            airlineInfo: [],
        },
        customFields: [],
        tripId: '',
        suspendReason: '',
        totalFareAmount: {
            base: {
                amount: 150,
                convertedAmount: 0,
                convertedCurrency: '',
                currencyCode: 'USD',
            },
            tax: {
                amount: 15,
            },
        },
    },
};

const hotelPnr: Pnr = {
    pnrId: 'PNR_HOTEL_789',
    data: {
        hotelPnr: {
            checkInDateTime: {iso8601: '2023-10-05T15:00:00Z'},
            checkOutDateTime: {iso8601: '2023-10-07T11:00:00Z'},
            hotelInfo: {
                name: 'Grand Hotel',
                address: {
                    addressLines: ['456 Elm St'],
                    locality: 'New York',
                    administrativeArea: '',
                    administrativeAreaName: '',
                    continentCode: '',
                    description: '',
                    isDefault: false,
                    languageCode: '',
                    locationCode: '',
                    organization: '',
                    postalCode: '',
                    recipients: [],
                    regionCode: '',
                    regionName: '',
                    revision: 0,
                    sortingCode: '',
                    sublocality: '',
                    timezone: '',
                },
                chainName: 'Premium Hotels',
                chainCode: 'PH',
                additionalAmenities: [],
                amenities: [],
                brandName: '',
                coordinates: {
                    latitude: 0,
                    longitude: 0,
                },
                descriptions: [],
                email: '',
                fax: [],
                hotelId: '',
                imageSets: [],
                masterChainCode: '',
                phone: {
                    countryCode: 0,
                    countryCodeSource: '',
                    extension: '',
                    isoCountryCode: '',
                    italianLeadingZero: false,
                    nationalNumber: 0,
                    numberOfLeadingZeros: 0,
                    preferredDomesticCarrierCode: '',
                    rawInput: '',
                    type: '',
                },
                starRating: 0,
                thirdPartyHotelCodes: [],
            },
            numberOfRooms: 2,
            room: {
                roomName: 'Deluxe Suite',
                cancellationPolicy: {
                    policy: 'Non-refundable',
                    deadline: {iso8601: '2023-10-04T15:00:00Z'},
                    deadlineUtc: {
                        iso8601: '',
                    },
                },
                additionalAmenities: [],
                additionalDetails: [],
                amenities: [],
                bedCount: 0,
                bedType: '',
                guaranteeType: '',
                imageSets: [],
                meals: {
                    mealPlan: '',
                    mealsIncluded: [],
                },
                rateInfo: {
                    isFopModifiable: false,
                    isModifiable: false,
                    nightlyRate: {
                        amount: 0,
                        convertedAmount: 0,
                        convertedCurrency: '',
                        currencyCode: '',
                        otherCoinage: [],
                    },
                    nightlyRates: [],
                    postpaidRate: {
                        base: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
                        extras: [],
                        includesCommission: false,
                        tax: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
                    },
                    prepaidRate: {
                        base: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
                        extras: [],
                        includesCommission: false,
                        tax: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
                    },
                    rateCode: '',
                    rateType: '',
                    totalRate: {
                        base: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
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
                        extras: [],
                        includesCommission: false,
                        tax: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: '',
                            currencyCode: '',
                            otherCoinage: [],
                        },
                        taxBreakdown: {
                            tax: [],
                        },
                        transactionDate: {
                            iso8601: '',
                        },
                    },
                },
                roomInfo: {
                    roomType: '',
                    roomTypeCode: '',
                    typeClassDescription: '',
                },
            },
            vendorConfirmationNumber: 'HOTELCONF123',
            hotelSpecialRequests: {
                accessibleFeatures: [],
                additionalNote: '',
                flightNumber: '',
                roomFeatures: [],
                roomLocations: [],
            },
            occupancy: [],
            payment: {
                description: '',
                paymentType: '',
            },
            pnrStatus: '',
            preferences: [],
            preferredType: [],
            sortingPriority: 0,
            sourceStatus: '',
            travelerInfos: [],
            vendorCancellationId: '',
            vendorReferenceId: '',
        },
        pnrTravelers: [
            {
                personalInfo: {
                    name: {family1: 'Johnson', given: 'Emily', middle: '', family2: '', preferred: ''},
                    email: 'emily.johnson@example.com',
                    addresses: [],
                    phoneNumbers: [],
                },
                userId: {
                    id: '',
                },
                travelerInfo: {},
                loyalties: [],
                persona: '',
                businessInfo: {
                    companySpecifiedAttributes: [],
                },
                tier: '',
            },
        ],
        version: 0,
        travelers: [],
        transactions: [],
        additionalMetadata: {
            airportInfo: [],
            airlineInfo: [],
        },
        customFields: [],
        tripId: '',
        suspendReason: '',
        totalFareAmount: {
            base: {
                amount: 200,
                convertedAmount: 0,
                convertedCurrency: '',
                currencyCode: 'USD',
            },
            tax: {
                amount: 20,
            },
        },
    },
};

// Trip containing all types of reservations
const tripWithAllReservations: TripData = {
    ...basicTripData,
    pnrs: [airPnrDirect, airPnrConnecting, railPnr, carPnr, hotelPnr],
};

const airReservationPnrData: Pnr = {
    data: {
        additionalMetadata: {
            airlineInfo: [
                {
                    airlineCode: 'UA',
                    airlineName: 'United Airlines',
                },
            ],
            airportInfo: [
                {
                    airportCode: 'DEN',
                    airportName: 'Denver International Airport',
                    cityName: 'Denver',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'CO',
                    zoneName: 'America/Denver',
                },
                {
                    airportCode: 'SFO',
                    airportName: 'San Francisco International Airport',
                    cityName: 'San Francisco',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'CA',
                    zoneName: 'America/Los_Angeles',
                },
            ],
        },
        airPnr: {
            airPnrRemarks: [],
            automatedCancellationInfo: {
                supportedCancellations: [
                    {
                        cancelType: 'VOID',
                        maxCancellationDateTime: {
                            iso8601: '2025-10-14T16:56:00Z',
                        },
                        refund: {
                            amount: 176.96,
                            convertedAmount: 176.96,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                            otherCoinage: [],
                        },
                        totalFare: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                        },
                    },
                ],
            },
            automatedExchangeInfo: {
                supportedExchanges: [
                    {
                        legInfos: [
                            {
                                legIdx: 0,
                            },
                            {
                                legIdx: 1,
                            },
                        ],
                    },
                ],
            },
            bookingMetadata: {
                fareStatistics: {
                    statisticsItems: [
                        {
                            statisticType: 'MINIMUM',
                            totalFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MEDIAN',
                            totalFare: {
                                base: {
                                    amount: 238.47,
                                    convertedAmount: 238.47,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 58.19,
                                    convertedAmount: 58.19,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MAXIMUM',
                            totalFare: {
                                base: {
                                    amount: 652.61,
                                    convertedAmount: 652.61,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 98.95,
                                    convertedAmount: 98.95,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                    ],
                },
            },
            legs: [
                {
                    brandName: 'Basic Economy',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 0,
                                        description: 'tftwrwywamxhpjqlyycvvkqz',
                                        fee: [],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [],
                                    },
                                ],
                                checkedIn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'diwhoogsrhyyemaairpxujmwcukgqe',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 40,
                                                    convertedAmount: 40,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'upqoxyrbchclkgklvivjsqepprieync',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 50,
                                                    convertedAmount: 50,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'ybgdbbqzejberu',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'swpuoimrgavuanivflcpbxjihu',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [
                                {
                                    aircraftAmenity: {
                                        displayText: 'Boeing 757-300',
                                    },
                                    beverageAmenity: {
                                        alcoholCost: 'paid',
                                        displayText: 'Alcohol (fee) & beverages provided',
                                    },
                                    entertainmentAmenity: {
                                        cost: 'free',
                                        displayText: 'Streaming entertainment',
                                    },
                                    freshFoodAmenity: {
                                        cost: 'paid',
                                        displayText: 'Premium snacks (fee)',
                                    },
                                    layoutAmenity: {
                                        directAisleAccess: 'no',
                                        displayText: '3-3 seat layout',
                                    },
                                    powerAmenity: {
                                        cost: 'free',
                                        displayText: 'Power outlet',
                                        powerOutlet: 'yes',
                                        usbPort: 'no',
                                    },
                                    seatAmenity: {
                                        displayText: '76 cm seat pitch',
                                        legroom: 'standard',
                                        pitch: 30,
                                        width: 'standard',
                                    },
                                    wifiAmenity: {
                                        cost: 'paid',
                                        displayText: 'Fast web browsing (fee)',
                                    },
                                },
                            ],
                            arrivalDateTime: {
                                iso8601: '2026-01-25T11:58:00',
                            },
                            arrivalGate: {
                                gate: '',
                                terminal: '3',
                            },
                            bookingCode: 'N',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.2799,
                                emissionValue: 0.246312,
                                flightDistanceKm: 1653,
                                isApproximate: false,
                            },
                            departureDateTime: {
                                iso8601: '2026-01-25T10:08:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: '',
                            },
                            destination: 'SFO',
                            distance: {
                                length: 964,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT2H50M',
                            },
                            equipment: {
                                code: '753',
                                name: 'huesfawcrrrthf',
                                type: '',
                            },
                            flightId: 'CgNERU4SA1NGTxoVChMyMDI2LTAxLTI1VDEwOjA4OjAwIhUKEzIwMjYtMDEtMjVUMTE6NTg6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'UA',
                                num: '2041',
                            },
                            operating: {
                                airlineCode: 'UA',
                                num: '2041',
                            },
                            operatingAirlineName: '',
                            origin: 'DEN',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            // @ts-expect-error: Test data
                            upas: [
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/basic-economy.html',
                                    headline: 'United Economy',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Leather seats with adjustable headrests provide a comfortable flight. United Economy seats are located at the back and middle of the plane.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large_square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: '',
                                    headline: "Step Inside United's 757-300",
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [
                                        {
                                            caption: "Step Inside United's 757-300",
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/large_square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    url: '',
                                                },
                                            ],
                                        },
                                    ],
                                    video: [],
                                },
                                {
                                    categories: ['WIFI'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/inflight-wifi.html',
                                    headline: 'Free onboard messaging for all!',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/large/Wi-Fi.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Send messages from your favorite apps for free, or purchase Wi-Fi to surf the web, scroll through Instagram, catch up on Facebook and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large_square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/small/Wi-Fi.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['ENTERTAINMENT'],
                                    externalDetailsUrl: 'https://unitedprivatescreening.com/personal-devices',
                                    headline: 'Stream content using your device',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/large/entertainment.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Explore a curated library of gripping movies, great TV shows, games and more on an award-winning in-flight entertainment system.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large_square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/small/entertainment.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['MEALS'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/united-economy.html',
                                    headline: 'Refuel during the flight',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/large/meals-beverage-6.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Enjoy complimentary snacks and refreshing soft drinks, juices, tea and illy coffee when you fly United Economy.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large_square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/small/meals-beverage-6.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['PROMOTION'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/united-app.html',
                                    headline: 'Travel with the United app',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/large/check-in.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Receive real-time trip updates without unlocking your device, plus useful terminal guides, the bag tracker feature, a help center, and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large_square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/small/check-in.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                            ],
                            vendorConfirmationNumber: 'E89J5G',
                        },
                    ],
                    legId: 'CgNERU4SA1NGTxoKMTUxNjkxODMzNA==',
                    legIndex: 0,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [
                        {
                            blockedReason: '',
                            label: '',
                            preferredType: 'NOT_PREFERRED',
                        },
                    ],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 0,
                    travelerRestrictions: [
                        {
                            restrictions: ['SSR_EDIT_NOT_ALLOWED', 'OSI_EDIT_NOT_ALLOWED'],
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    validatingAirlineCode: 'UA',
                },
                {
                    brandName: 'Basic Economy',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 0,
                                        description: 'negyksvotoejzmfmuqioylyv',
                                        fee: [],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [],
                                    },
                                ],
                                checkedIn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'fukkgdvudooruaazpduyrprsbosljr',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 40,
                                                    convertedAmount: 40,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'gzmhabvfokqwenrmbryfbomagxkixsj',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 50,
                                                    convertedAmount: 50,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'ushekxgvsmdvwf',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'kdgtbvbxbqzsivdigdcehjcyhy',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [
                                {
                                    aircraftAmenity: {
                                        displayText: 'Boeing 757-300',
                                    },
                                    beverageAmenity: {
                                        alcoholCost: 'paid',
                                        displayText: 'Alcohol (fee) & beverages provided',
                                    },
                                    entertainmentAmenity: {
                                        cost: 'free',
                                        displayText: 'Streaming entertainment',
                                    },
                                    freshFoodAmenity: {
                                        cost: 'paid',
                                        displayText: 'Premium snacks (fee)',
                                    },
                                    layoutAmenity: {
                                        directAisleAccess: 'no',
                                        displayText: '3-3 seat layout',
                                    },
                                    powerAmenity: {
                                        cost: 'free',
                                        displayText: 'Power outlet',
                                        powerOutlet: 'yes',
                                        usbPort: 'no',
                                    },
                                    seatAmenity: {
                                        displayText: '76 cm seat pitch',
                                        legroom: 'standard',
                                        pitch: 30,
                                        width: 'standard',
                                    },
                                    wifiAmenity: {
                                        cost: 'paid',
                                        displayText: 'Fast web browsing (fee)',
                                    },
                                },
                            ],
                            arrivalDateTime: {
                                iso8601: '2026-01-31T20:12:00',
                            },
                            arrivalGate: {
                                gate: '',
                                terminal: '',
                            },
                            bookingCode: 'N',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.2799,
                                emissionValue: 0.246312,
                                flightDistanceKm: 1653,
                                isApproximate: false,
                            },
                            departureDateTime: {
                                iso8601: '2026-01-31T16:31:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: '3',
                            },
                            destination: 'DEN',
                            distance: {
                                length: 964,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT2H41M',
                            },
                            equipment: {
                                code: '753',
                                name: 'yyfaoheehlhxim',
                                type: '',
                            },
                            flightId: 'CgNTRk8SA0RFThoVChMyMDI2LTAxLTMxVDE2OjMxOjAwIhUKEzIwMjYtMDEtMzFUMjA6MTI6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'UA',
                                num: '1430',
                            },
                            operating: {
                                airlineCode: 'UA',
                                num: '1430',
                            },
                            operatingAirlineName: '',
                            origin: 'SFO',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            // @ts-expect-error: Test data
                            upas: [
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/basic-economy.html',
                                    headline: 'United Economy',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Leather seats with adjustable headrests provide a comfortable flight. United Economy seats are located at the back and middle of the plane.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large_square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: '',
                                    headline: "Step Inside United's 757-300",
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [
                                        {
                                            caption: "Step Inside United's 757-300",
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/large_square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    url: '',
                                                },
                                            ],
                                        },
                                    ],
                                    video: [],
                                },
                                {
                                    categories: ['WIFI'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/inflight-wifi.html',
                                    headline: 'Free onboard messaging for all!',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/large/Wi-Fi.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Send messages from your favorite apps for free, or purchase Wi-Fi to surf the web, scroll through Instagram, catch up on Facebook and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large_square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/small/Wi-Fi.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['ENTERTAINMENT'],
                                    externalDetailsUrl: 'https://unitedprivatescreening.com/personal-devices',
                                    headline: 'Stream content using your device',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/large/entertainment.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Explore a curated library of gripping movies, great TV shows, games and more on an award-winning in-flight entertainment system.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large_square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/small/entertainment.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['MEALS'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/united-economy.html',
                                    headline: 'Refuel during the flight',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/large/meals-beverage-6.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Enjoy complimentary snacks and refreshing soft drinks, juices, tea and illy coffee when you fly United Economy.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large_square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/small/meals-beverage-6.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['PROMOTION'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/united-app.html',
                                    headline: 'Travel with the United app',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/large/check-in.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Receive real-time trip updates without unlocking your device, plus useful terminal guides, the bag tracker feature, a help center, and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large_square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/small/check-in.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                            ],
                            vendorConfirmationNumber: 'E89J5G',
                        },
                    ],
                    legId: 'CgNTRk8SA0RFThoKMTUxNjkxODMzNA==',
                    legIndex: 1,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [
                        {
                            blockedReason: '',
                            label: '',
                            preferredType: 'NOT_PREFERRED',
                        },
                    ],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 1,
                    travelerRestrictions: [
                        {
                            restrictions: ['SSR_EDIT_NOT_ALLOWED', 'OSI_EDIT_NOT_ALLOWED'],
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    validatingAirlineCode: 'UA',
                },
            ],
            otherServiceInfos: [],
            travelerInfos: [
                {
                    airVendorCancellationInfo: {
                        airVendorCancellationObjects: [],
                    },
                    appliedCredits: [],
                    boardingPass: [],
                    booking: {
                        itinerary: {
                            fareComponents: [
                                {
                                    baseFare: {
                                        amount: 77.38,
                                        convertedAmount: 77.38,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    // @ts-expect-error: Test data
                                    corpAccountCode: '',
                                    fareBasisCode: 'KAA5TWBN',
                                    farePaxType: 'UNKNOWN_PASSENGER_TYPE',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 0,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: 'TLG18',
                                },
                                {
                                    baseFare: {
                                        amount: 58.77,
                                        convertedAmount: 58.77,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    // @ts-expect-error: Test data
                                    corpAccountCode: '',
                                    fareBasisCode: 'GAK5TWBN',
                                    farePaxType: 'UNKNOWN_PASSENGER_TYPE',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 1,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: 'TLG18',
                                },
                            ],
                            flightFareBreakup: [
                                {
                                    flightsFare: {
                                        base: {
                                            amount: 136.15,
                                            convertedAmount: 136.15,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 40.81,
                                            convertedAmount: 40.81,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    legIndices: [0, 1],
                                },
                            ],
                            otherAncillaryFares: [],
                            totalFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            totalFlightsFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                        },
                        luggageDetails: [],
                        otherAncillaries: [],
                        otherCharges: [],
                        seats: [],
                    },
                    createdMcos: [],
                    paxType: 'ADULT',
                    specialServiceRequestInfos: [],
                    tickets: [
                        {
                            amount: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            ancillaries: [],
                            associatedTicketNumber: '',
                            commission: {
                                amount: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                percent: 0,
                            },
                            conjunctionTicketSuffix: [],
                            exchangePolicy: {
                                exchangePenalty: {
                                    amount: 149,
                                    convertedAmount: 149,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                isCat16: false,
                                isConditional: false,
                                isExchangeable: true,
                            },
                            fareCalculation: '',
                            flightCoupons: [
                                {
                                    flightIdx: 0,
                                    legIdx: 1,
                                    status: 'NOT_FLOWN',
                                },
                                {
                                    flightIdx: 0,
                                    legIdx: 0,
                                    status: 'NOT_FLOWN',
                                },
                            ],
                            hemisphereCode: '',
                            iataNumber: '45526666',
                            issuedDateTime: {
                                iso8601: '2025-10-13T11:57:00',
                            },
                            journeyCode: '',
                            mcoIssuanceEligibility: 'NOT_ELIGIBLE',
                            paymentDetails: [
                                {
                                    amount: {
                                        base: {
                                            amount: 136.15,
                                            convertedAmount: 136.15,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 40.81,
                                            convertedAmount: 40.81,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    fop: {
                                        additionalInfo: '',
                                        card: {
                                            address: {
                                                addressLines: ['9899 S Field Way'],
                                                administrativeArea: '',
                                                administrativeAreaName: '',
                                                continentCode: '',
                                                description: '',
                                                isDefault: false,
                                                languageCode: '',
                                                locality: '',
                                                locationCode: '',
                                                organization: '',
                                                postalCode: '80127',
                                                recipients: [],
                                                regionCode: 'US',
                                                regionName: '',
                                                revision: 0,
                                                sortingCode: '',
                                                sublocality: '',
                                                timezone: '',
                                            },
                                            company: 'VISA',
                                            currency: '',
                                            cvv: '',
                                            // @ts-expect-error: Test data
                                            expiry: [],
                                            expiryMonth: 9,
                                            expiryYear: 2028,
                                            externalId: '',
                                            id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                            label: 'Expensify Card',
                                            name: 'lsmhydeiufn',
                                            number: '4XXXXXXXXXXX7280',
                                            type: 'CREDIT',
                                        },
                                        paymentMethod: 'CREDIT_CARD',
                                        type: 'CARD',
                                    },
                                    isRefunded: false,
                                },
                            ],
                            pcc: 'A4L0',
                            publishedFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            refundPolicy: {
                                isCat16: false,
                                isConditional: false,
                                isRefundable: false,
                                isRefundableByObt: false,
                            },
                            rficCode: '',
                            status: 'ISSUED',
                            taxBreakdown: {
                                tax: [
                                    {
                                        amount: {
                                            amount: 10.21,
                                            convertedAmount: 10.21,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'US',
                                    },
                                    {
                                        amount: {
                                            amount: 10.4,
                                            convertedAmount: 10.4,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'ZP',
                                    },
                                    {
                                        amount: {
                                            amount: 11.2,
                                            convertedAmount: 11.2,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'AY',
                                    },
                                    {
                                        amount: {
                                            amount: 9,
                                            convertedAmount: 9,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'XF',
                                    },
                                ],
                            },
                            ticketIncompleteReasons: [],
                            ticketNumber: '0162339781701',
                            ticketSettlement: 'ARC_TICKET',
                            ticketType: 'FLIGHT',
                            validatingAirlineCode: 'UA',
                            vendorCancellationId: '',
                        },
                    ],
                    travelerIdx: 0,
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
            ],
        },
        approvalInfo: [
            {
                approvalStatus: 'APPROVAL_NOT_REQUIRED',
                approvalType: 'PASSIVE_APPROVAL',
            },
        ],
        bookingHistory: [
            {
                bookerInfo: {
                    email: 'qxnuccbych@jpgzbgsws.com',
                    name: 'dzoojdygwxx',
                    role: 'TRAVELER',
                    tmcName: '',
                },
                bookingInfo: {
                    bookingSourceClient: 'WEB',
                    status: 'BOOKED',
                    updatedDateTime: {
                        iso8601: '2025-10-13T16:57:37Z',
                    },
                },
            },
        ],
        bookingStatus: 'CONFIRMED_STATUS',
        contactSupport: false,
        costOfGoodsSold: {
            payments: [
                {
                    fop: {
                        accessType: {
                            accessType: 'PERSONAL',
                            entities: [
                                {
                                    centralCardAccessLevel: 'UNKNOWN',
                                    entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                },
                            ],
                            entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                        },
                        additionalInfo: '',
                        card: {
                            address: {
                                addressLines: ['9899 S Field Way'],
                                administrativeArea: 'Colorado',
                                administrativeAreaName: '',
                                continentCode: '',
                                description: 'ogfcooyjzqmslwg',
                                isDefault: false,
                                languageCode: '',
                                locality: 'Littleton',
                                locationCode: '',
                                organization: '',
                                postalCode: '80127',
                                recipients: [],
                                regionCode: 'US',
                                regionName: '',
                                revision: 0,
                                sortingCode: '',
                                sublocality: '',
                                timezone: '',
                            },
                            company: 'VISA',
                            currency: '',
                            cvv: '',
                            expiry: [],
                            expiryMonth: 9,
                            expiryYear: 2028,
                            externalId: '',
                            id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                            label: 'Expensify Card',
                            name: 'werawcqktad',
                            number: '4XXXXXXXXXXX7280',
                            type: 'CREDIT',
                            vaultId: '00000000-0000-0000-0000-000000000000',
                        },
                        paymentMetadata: {
                            cardMetadata: {
                                accessType: {
                                    accessType: 'PERSONAL',
                                    entities: [
                                        {
                                            centralCardAccessLevel: 'UNKNOWN',
                                            entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                        },
                                    ],
                                    entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                                },
                                card: {
                                    address: {
                                        addressLines: ['9899 S Field Way'],
                                        administrativeArea: 'Colorado',
                                        administrativeAreaName: '',
                                        continentCode: '',
                                        description: 'ryjmcdtqppdyhnl',
                                        isDefault: false,
                                        languageCode: '',
                                        locality: 'Littleton',
                                        locationCode: '',
                                        organization: '',
                                        postalCode: '80127',
                                        recipients: [],
                                        regionCode: 'US',
                                        regionName: '',
                                        revision: 0,
                                        sortingCode: '',
                                        sublocality: '',
                                        timezone: '',
                                    },
                                    company: 'VISA',
                                    currency: '',
                                    cvv: '',
                                    expiry: [],
                                    expiryMonth: 9,
                                    expiryYear: 2028,
                                    externalId: '',
                                    id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                    label: 'Expensify Card',
                                    name: 'ybybqznpcwt',
                                    number: '4XXXXXXXXXXX7280',
                                    type: 'CREDIT',
                                    vaultId: '00000000-0000-0000-0000-000000000000',
                                },
                                isLodgeCard: false,
                            },
                        },
                        paymentMethod: 'CREDIT_CARD',
                        paymentSourceType: 'CARD',
                        type: 'CARD',
                    },
                    isRefunded: false,
                    networkTransactionId: '',
                    paymentGateway: 'PAYMENT_GATEWAY_UNKNOWN',
                    paymentId: '',
                    paymentReference: '',
                    paymentThirdParty: 'UNKNOWN_PARTY',
                    paymentType: 'FLIGHTS',
                    travelerIndices: [0],
                    userIds: [
                        {
                            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                        },
                    ],
                },
            ],
        },
        createdVia: 'OBT',
        customFields: [],
        customFieldsV3Responses: [],
        documents: [],
        initialVersionCreatedVia: 'OBT',
        invoiceDelayedBooking: false,
        invoiceInfos: [
            {
                invoiceId: 'de54fc87-bd22-4fb9-ba1d-0e049ceb26e5',
                invoiceNumber: 'SOLUTIONSTRAVEL-US-RPT-112039',
                productType: 'PNR',
            },
        ],
        isFinalized: true,
        llfPnrInfo: {
            totalFare: {
                amount: 246.97,
                convertedAmount: 246.97,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
        },
        owningPccInfo: {
            zoneId: 'America/Chicago',
        },
        paymentInfo: [
            {
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: '',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: '',
                            isDefault: false,
                            languageCode: '',
                            locality: '',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'yotnazudkrj',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                    },
                    paymentMethod: 'CREDIT_CARD',
                    type: 'CARD',
                },
                netCharge: {
                    amount: 176.96,
                    convertedAmount: 176.96,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalCharge: {
                    amount: 176.96,
                    convertedAmount: 176.96,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalRefund: {
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
            },
            {
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: 'Colorado',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: 'paiskbvgytepgpz',
                            isDefault: false,
                            languageCode: '',
                            locality: 'Littleton',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'jrcdvnvvjpg',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                        vaultId: '00000000-0000-0000-0000-000000000000',
                    },
                    paymentMetadata: {
                        cardMetadata: {
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    administrativeAreaName: '',
                                    continentCode: '',
                                    description: 'phkfyirzszwmxxn',
                                    isDefault: false,
                                    languageCode: '',
                                    locality: 'Littleton',
                                    locationCode: '',
                                    organization: '',
                                    postalCode: '80127',
                                    recipients: [],
                                    regionCode: 'US',
                                    regionName: '',
                                    revision: 0,
                                    sortingCode: '',
                                    sublocality: '',
                                    timezone: '',
                                },
                                company: 'VISA',
                                currency: '',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                externalId: '',
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'reursbzyfvn',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                                vaultId: '00000000-0000-0000-0000-000000000000',
                            },
                            isLodgeCard: false,
                        },
                    },
                    paymentMethod: 'CREDIT_CARD',
                    paymentSourceType: 'CARD',
                    type: 'UNKNOWN',
                },
                netCharge: {
                    amount: 10,
                    convertedAmount: 10,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalCharge: {
                    amount: 10,
                    convertedAmount: 10,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalRefund: {
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
            },
        ],
        pnrCreationDetails: [],
        pnrId: '1516918334',
        pnrTravelers: [
            {
                businessInfo: {
                    // @ts-expect-error: Test data
                    companyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    companyInfo: {
                        externalId: '',
                        id: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        name: 'aaeoxzjwi',
                    },
                    companySpecifiedAttributes: [
                        {
                            fixedColumnName: 'COMPANY_CODE',
                            value: '',
                        },
                        {
                            fixedColumnName: 'LOCATION_CODE',
                            value: '',
                        },
                    ],
                    legalEntity: {
                        companySpecifiedAttributes: [],
                        countryCode: 'US',
                        ein: '',
                        externalId: '',
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                        name: 'pwbpiqwwqrtdyp',
                    },
                },
                loyalties: [],
                originalBusinessInfo: {
                    companyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    companyInfo: {
                        externalId: '',
                        id: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        name: 'umrzcgske',
                    },
                    legalEntity: {
                        companySpecifiedAttributes: [],
                        countryCode: 'US',
                        ein: '',
                        externalId: '',
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                        name: 'sbhwynzjwzfgog',
                    },
                },
                persona: 'EMPLOYEE',
                personalInfo: {
                    dob: {
                        iso8601: '1992-03-11',
                    },
                    email: 'qxnuccbych@jpgzbgsws.com',
                    gender: 'MALE',
                    // @ts-expect-error: Test data
                    name: '***',
                    phoneNumbers: [
                        {
                            countryCode: 0,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: '',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '17206574277',
                            type: 'UNKNOWN_TYPE',
                        },
                    ],
                },
                tier: 'BASIC',
                travelerInfo: {
                    adhocTravelerInfo: [],
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
                userId: {
                    id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                },
            },
        ],
        policyInfo: {
            appliedPolicyInfo: {
                policies: [
                    {
                        id: 'b8225f6c-f9bd-4566-9dc0-f6b7fc0046b0',
                        version: '54',
                    },
                ],
                ruleResultInfos: [
                    {
                        actions: [
                            {
                                takeApproval: {
                                    allRequired: false,
                                    hardApprovalRequired: false,
                                    numHierarchyLevels: 1,
                                    positionTitles: [],
                                    userOrgIds: [],
                                },
                            },
                        ],
                        subViolationInfos: [],
                        violationInfos: [],
                    },
                ],
            },
            approverName: {
                family1: '',
                family2: '',
                given: 'Cole Eason',
                middle: '',
                preferred: '',
            },
            outOfPolicy: false,
            reason: '',
            reasonCode: 'UNKNOWN_CHECKOUT_ANSWER_TYPE',
        },
        preBookAnswers: {
            answers: [],
        },
        savingsFare: {
            fareAmount: {
                base: {
                    amount: 136.15,
                    convertedAmount: 136.15,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                },
                tax: {
                    amount: 40.81,
                    convertedAmount: 40.81,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                },
            },
            isTaxIncluded: true,
        },
        serviceFees: [
            {
                fare: {
                    base: {
                        amount: 10,
                        convertedAmount: 10,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                    tax: {
                        amount: 0,
                        convertedAmount: 0,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                },
                feeInfo: {
                    bookingFeeType: 'TRIP_FEE',
                    calculatedAmount: {
                        amount: 10,
                        convertedAmount: 10,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                    chargeProcessorInfo: {
                        chargeProcessorType: 'RULE_BASED_INFO',
                        ruleName: 'DEFAULT',
                    },
                    feeType: 'BOOKING_FEE',
                },
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: 'Colorado',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: 'bsvvbfnslrdjxsk',
                            isDefault: false,
                            languageCode: '',
                            locality: 'Littleton',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'vyfnaeligka',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                        vaultId: '00000000-0000-0000-0000-000000000000',
                    },
                    paymentMetadata: {
                        cardMetadata: {
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    administrativeAreaName: '',
                                    continentCode: '',
                                    description: 'aslcbtnlbaqanmz',
                                    isDefault: false,
                                    languageCode: '',
                                    locality: 'Littleton',
                                    locationCode: '',
                                    organization: '',
                                    postalCode: '80127',
                                    recipients: [],
                                    regionCode: 'US',
                                    regionName: '',
                                    revision: 0,
                                    sortingCode: '',
                                    sublocality: '',
                                    timezone: '',
                                },
                                company: 'VISA',
                                currency: '',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                externalId: '',
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'pzeuiiuyhqz',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                                vaultId: '00000000-0000-0000-0000-000000000000',
                            },
                            isLodgeCard: false,
                        },
                    },
                    paymentMethod: 'CREDIT_CARD',
                    paymentSourceType: 'CARD',
                    type: 'UNKNOWN',
                },
                paymentTransactionInfo: {
                    gatewayInfo: {
                        stripeInfo: [],
                    },
                },
                status: 'PENDING',
                ticketNumber: '',
                visibleToTraveler: true,
            },
        ],
        sourceInfo: {
            bookingDateTime: {
                iso8601: '2025-10-13T16:57:37Z',
            },
            bookingSource: 'FARELOGIX_NDC',
            iataNumber: '',
            posDescriptor: 'A4L0',
            sourcePnrId: 'KM6STH',
            thirdParty: 'FARELOGIX_NDC',
        },
        totalFare: {
            amount: 186.96,
            convertedAmount: 186.96,
            convertedCurrency: 'USD',
            currencyCode: 'USD',
        },
        totalFareAmount: {
            base: {
                amount: 136.15,
                convertedAmount: 136.15,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
            tax: {
                amount: 40.81,
                // @ts-expect-error: Test data
                convertedAmount: 40.81,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
        },
        transactions: [
            {
                // @ts-expect-error: Test data
                bookerInfo: {
                    bookerId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                    bookerName: 'Alex Beaman',
                    bookerRole: 'TRAVELER',
                },
                ctc: [
                    {
                        amount: {
                            amount: 176.96,
                            convertedAmount: 176.96,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                        },
                        balanceDue: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                        },
                        fop: {
                            additionalInfo: '',
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    postalCode: '80127',
                                    regionCode: 'US',
                                },
                                company: 'VISA',
                                cvv: '',
                                expiry: {
                                    expiry: {
                                        expiryMonth: 9,
                                        expiryYear: 2028,
                                    },
                                },
                                expiryMonth: 9,
                                expiryYear: 2028,
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'thdgezgwysp',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                            },
                            paymentMethod: 'CREDIT_CARD',
                            type: 'CARD',
                        },
                        isGuarantee: false,
                        isRefunded: false,
                        transactionStatus: 'CHARGED',
                    },
                ],
                itemGroups: [
                    {
                        confirmationNumber: '0162339781701',
                        invoiceData: {
                            buyer: {
                                address: 'Expensify, Inc,\n401 SW 5th Ave,\nPortland,\nOR US 97204',
                                idInfo: [],
                                name: 'yedajsgtnab',
                            },
                            invoiceNumber: 'SOLUTIONSTRAVEL-US-RPT-112039',
                            seller: {
                                address: '115 Broadway ST,\nNY,\nNY US 10006',
                                idInfo: [
                                    {
                                        idType: 'EIN',
                                        value: '842924335',
                                    },
                                ],
                                name: 'bjailgxf',
                            },
                        },
                        items: [
                            {
                                airItemType: 'FLIGHT',
                                ancillaryTypes: [],
                                flights: [
                                    {
                                        arrivalDateTime: {
                                            iso8601: '2026-01-25T11:58:00',
                                        },
                                        cabin: 'ECONOMY',
                                        departureDateTime: {
                                            iso8601: '2026-01-25T10:08:00',
                                        },
                                        destination: {
                                            airportCode: 'SFO',
                                            airportName: 'San Francisco International Airport',
                                            cityCode: '',
                                        },
                                        marketing: {
                                            airlineCode: 'UA',
                                            num: '2041',
                                        },
                                        operating: {
                                            airlineCode: 'UA',
                                            num: '2041',
                                        },
                                        origin: {
                                            airportCode: 'DEN',
                                            airportName: 'Denver International Airport',
                                            cityCode: '',
                                        },
                                    },
                                    {
                                        arrivalDateTime: {
                                            iso8601: '2026-01-31T20:12:00',
                                        },
                                        cabin: 'ECONOMY',
                                        departureDateTime: {
                                            iso8601: '2026-01-31T16:31:00',
                                        },
                                        destination: {
                                            airportCode: 'DEN',
                                            airportName: 'Denver International Airport',
                                            cityCode: '',
                                        },
                                        marketing: {
                                            airlineCode: 'UA',
                                            num: '1430',
                                        },
                                        operating: {
                                            airlineCode: 'UA',
                                            num: '1430',
                                        },
                                        origin: {
                                            airportCode: 'SFO',
                                            airportName: 'San Francisco International Airport',
                                            cityCode: '',
                                        },
                                    },
                                ],
                                itemType: 'AIR_ITEM',
                                oldFlights: [],
                            },
                        ],
                        previousTransactionFares: [],
                        totalAmount: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                        },
                        totalAmountDiff: {
                            base: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                            tax: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                        },
                        transactionAmount: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                        },
                        transactionAmountDiff: {
                            base: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                            tax: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                        },
                        transactionDateTime: {
                            iso8601: '2025-10-13T16:58:15',
                        },
                        transactionFares: [
                            {
                                amount: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'BASE_AMOUNT',
                            },
                            {
                                amount: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'OTHER_FEE_AND_TAXES',
                            },
                            {
                                amount: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'CHARGE_BASE',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'CHARGE_TOTAL',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'TOTAL',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'SUB_TOTAL',
                            },
                        ],
                        transactionType: 'AIR_TICKET_ISSUED',
                        userId: {
                            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                        },
                    },
                ],
                pnrVersion: 2,
            },
        ],
        travelerPnrVisibilityStatus: 'VISIBLE',
        travelers: [
            {
                isActive: true,
                persona: 'EMPLOYEE',
                tier: 'BASIC',
                user: {
                    // @ts-expect-error: Test data
                    dob: {
                        iso8601: '1992-03-11',
                    },
                    email: 'qxnuccbych@jpgzbgsws.com',
                    gender: 'MALE',
                    name: '***',
                    paymentInfos: [
                        {
                            access: {
                                accessType: 'PERSONAL',
                                entities: [
                                    {
                                        centralCardAccessLevel: 'UNKNOWN',
                                        entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                    },
                                ],
                                entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                            },
                            accessType: 'PERSONAL',
                            applicableTo: [],
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    description: 'lcjbunexhvxdsah',
                                    locality: 'Littleton',
                                    postalCode: '80127',
                                    regionCode: 'US',
                                },
                                company: 'VISA',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'ebushzpgldg',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                            },
                        },
                    ],
                    phoneNumbers: [
                        {
                            countryCode: 0,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: '',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '17206574277',
                            type: 'UNKNOWN_TYPE',
                        },
                    ],
                },
                userBusinessInfo: {
                    // @ts-expect-error: Test data
                    designation: '',
                    email: 'qxnuccbych@jpgzbgsws.com',
                    employeeId: '',
                    legalEntityId: {
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                    },
                    managerBasicInfo: {
                        email: 'xahh@jtemomrrc.com',
                        isActive: true,
                        name: '***',
                        persona: 'EMPLOYEE',
                        profilePicture: {
                            data: '',
                            dimensions: {
                                height: 0,
                                width: 0,
                            },
                            url: '',
                        },
                        tier: 'BASIC',
                        userOrgId: {
                            organizationAgencyId: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            organizationId: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            userId: {
                                id: '8e2e29f8-4d2a-4112-baa4-f06896df1de6',
                            },
                        },
                    },
                    organizationId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                },
                userOrgId: {
                    organizationAgencyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    organizationId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    tmcBasicInfo: {
                        bookingTmc: {
                            id: {
                                id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                            },
                        },
                        contractingTmc: {
                            id: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            logo: {
                                data: '',
                                dimensions: {
                                    height: 0,
                                    width: 0,
                                },
                                url: 'https://images.spotnana.com/c3b13b1b-1672-48ab-9267-e2de069c4e3b',
                            },
                            name: 'veebzmiey',
                        },
                    },
                    tmcInfo: {
                        id: {
                            id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                        },
                        partnerTmcId: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        primaryServiceProviderTmc: {
                            tmcId: {
                                id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                            },
                        },
                        secondaryServiceProviderTmcs: [],
                    },
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
            },
        ],
        tripId: '3244189163',
        tripUsageMetadata: {
            eventMetadata: {
                eventId: '1726711769',
            },
            tripUsageType: 'EVENT',
        },
        version: 2,
    },
    pnrId: '1516918334',
};

const airReservationTravelers: PnrTraveler[] = [
    {
        businessInfo: {
            // @ts-expect-error: Test data
            companyId: {
                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
            },
            companyInfo: {
                externalId: '',
                id: {
                    id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                },
                name: 'aaeoxzjwi',
            },
            companySpecifiedAttributes: [
                {
                    fixedColumnName: 'COMPANY_CODE',
                    value: '',
                },
                {
                    fixedColumnName: 'LOCATION_CODE',
                    value: '',
                },
            ],
            legalEntity: {
                companySpecifiedAttributes: [],
                countryCode: 'US',
                ein: '',
                externalId: '',
                id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                name: 'pwbpiqwwqrtdyp',
            },
        },
        loyalties: [],
        originalBusinessInfo: {
            companyId: {
                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
            },
            companyInfo: {
                externalId: '',
                id: {
                    id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                },
                name: 'umrzcgske',
            },
            legalEntity: {
                companySpecifiedAttributes: [],
                countryCode: 'US',
                ein: '',
                externalId: '',
                id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                name: 'sbhwynzjwzfgog',
            },
        },
        persona: 'EMPLOYEE',
        personalInfo: {
            dob: {
                iso8601: '1992-03-11',
            },
            email: 'qxnuccbych@jpgzbgsws.com',
            gender: 'MALE',
            // @ts-expect-error: Test data
            name: '***',
            phoneNumbers: [
                {
                    countryCode: 0,
                    countryCodeSource: 'UNSPECIFIED',
                    extension: '',
                    isoCountryCode: '',
                    italianLeadingZero: false,
                    nationalNumber: 0,
                    numberOfLeadingZeros: 0,
                    preferredDomesticCarrierCode: '',
                    rawInput: '17206574277',
                    type: 'UNKNOWN_TYPE',
                },
            ],
        },
        tier: 'BASIC',
        travelerInfo: {
            adhocTravelerInfo: [],
            userId: {
                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
            },
        },
        userId: {
            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
        },
    },
];

describe('TripReservationUtils', () => {
    describe('getAirReservations', () => {
        it('should return air reservations when there are air reservations', () => {
            const result = getAirReservations(airReservationPnrData, airReservationTravelers);
            expect(result).toHaveLength(2);
            // We sort the values based on legIdx, so we expect the first value to have legId 0
            // and the second value to have legId 1
            // This check will fail if the values are not sorted correctly in getAirReservations
            expect(result.at(0)?.reservation.legId).toBe(0);
            expect(result.at(1)?.reservation.legId).toBe(1);
        });
    });
    describe('getReservationsFromTripReport', () => {
        it('should return an empty array when there are no transactions and trip payload', () => {
            const report = createRandomReport(1);
            const result = getReservationsFromTripReport(report, []);
            expect(result).toEqual([]);
        });

        it('should return reservations from tripPayload', () => {
            const report = createRandomReport(1);
            report.tripData = {
                tripID: 'trip123',
                payload: tripWithAllReservations,
            };

            const result = getReservationsFromTripReport(report, []);
            expect(result).toHaveLength(7);
            expect(result.at(0)?.reservation.reservationID).toEqual('PNR_AIR_789');
            expect(result.at(1)?.reservation.reservationID).toEqual('PNR_RAIL_789');
            expect(result.at(2)?.reservation.reservationID).toEqual('PNR_CAR_789');
            expect(result.at(3)?.reservation.reservationID).toEqual('PNR_HOTEL_789');
            expect(result.at(4)?.reservation.reservationID).toEqual('PNR_AIR_CONNECTING_789');
            expect(result.at(5)?.reservation.reservationID).toEqual('PNR_AIR_CONNECTING_789');
            expect(result.at(6)?.reservation.reservationID).toEqual('PNR_AIR_CONNECTING_789');

            report.tripData = {
                tripID: 'trip123',
                payload: {
                    ...basicTripData,
                    pnrs: [hotelPnr],
                },
            };
            const resultWithSingleReservation = getReservationsFromTripReport(report, []);

            expect(resultWithSingleReservation).toHaveLength(1);
            expect(resultWithSingleReservation.at(0)?.reservation.reservationID).toEqual('PNR_HOTEL_789');
            expect(resultWithSingleReservation.at(0)?.reservation.type).toEqual(CONST.RESERVATION_TYPE.HOTEL);
        });
    });

    describe('getPNRReservationDataFromTripReport', () => {
        it('should return an empty array when there are no transactions and trip payload', () => {
            const report = createRandomReport(1);
            const result = getPNRReservationDataFromTripReport(report, []);
            expect(result).toEqual([]);
        });

        it('should return PNR reservation data from tripPayload', () => {
            const report = createRandomReport(1);
            report.tripData = {
                tripID: 'trip123',
                payload: tripWithAllReservations,
            };

            const result = getPNRReservationDataFromTripReport(report, []);
            expect(result).toHaveLength(5);
            expect(result.at(0)?.pnrID).toEqual('PNR_AIR_789');
            expect(result.at(1)?.pnrID).toEqual('PNR_RAIL_789');
            expect(result.at(2)?.pnrID).toEqual('PNR_CAR_789');
            expect(result.at(3)?.pnrID).toEqual('PNR_HOTEL_789');
            expect(result.at(4)?.pnrID).toEqual('PNR_AIR_CONNECTING_789');

            report.tripData = {
                tripID: 'trip123',
                payload: {
                    ...basicTripData,
                    pnrs: [airPnrConnecting],
                },
            };
            const resultWithSingleReservation = getPNRReservationDataFromTripReport(report, []);

            expect(resultWithSingleReservation).toHaveLength(1);
            expect(resultWithSingleReservation.at(0)?.pnrID).toEqual('PNR_AIR_CONNECTING_789');
            expect(resultWithSingleReservation.at(0)?.reservations).toHaveLength(3);

            const pnrReservation = resultWithSingleReservation.at(0);

            // Test the order of reservations
            expect(pnrReservation?.reservations.at(0)?.reservation?.start?.shortName).toEqual('EWR');
            expect(pnrReservation?.reservations.at(0)?.reservation?.end?.shortName).toEqual('LAX');
            expect(pnrReservation?.reservations.at(1)?.reservation?.start?.shortName).toEqual('LAX');
            expect(pnrReservation?.reservations.at(1)?.reservation?.end?.shortName).toEqual('MSP');
            expect(pnrReservation?.reservations.at(2)?.reservation?.start?.shortName).toEqual('MSP');
            expect(pnrReservation?.reservations.at(2)?.reservation?.end?.shortName).toEqual('EWR');
        });
    });
});
