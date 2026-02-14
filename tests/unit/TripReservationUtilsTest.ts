/* cspell:disable */
import {getAirReservations, getPNRReservationDataFromTripReport, getReservationsFromTripReport} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import type {Pnr, TripData} from '@src/types/onyx/TripData';
import {airReservationPnrData, airReservationTravelers} from '../data/TripAirReservationData';
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
                                number: '14C',
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

describe('TripReservationUtils', () => {
    describe('getAirReservations', () => {
        it('should return air reservations in the correct order', () => {
            const result = getAirReservations(airReservationPnrData, airReservationTravelers);
            expect(result).toHaveLength(2);
            // We sort the values based on legIdx, so we expect the first value to have legId 0
            // and the second value to have legId 1
            // This check will fail if the values are not sorted correctly in getAirReservations
            expect(result.at(0)?.reservation.legId).toBe(0);
            expect(result.at(1)?.reservation.legId).toBe(1);
        });

        it('should correctly extract the seat number from the seats array', () => {
            const result = getAirReservations(airReservationPnrData, airReservationTravelers);

            // The first leg has a seat assigned ("12A")
            expect(result.at(0)?.reservation.seatNumber).toBe('12A');

            // The second leg has no seat assigned (empty string)
            expect(result.at(1)?.reservation.seatNumber).toBe('');
        });

        it('should not serialize the entire seat object as the seat number', () => {
            const result = getAirReservations(airReservationPnrData, airReservationTravelers);

            // Verify the seat number is just the value, not a JSON object
            const seatNumber = result.at(0)?.reservation.seatNumber;
            expect(seatNumber).not.toContain('{');
            expect(seatNumber).not.toContain('amount');
            expect(seatNumber).not.toContain('legIdx');
        });
    });
    describe('getReservationsFromTripReport', () => {
        it('should return an empty array when there are no transactions and trip payload', () => {
            const report = createRandomReport(1, undefined);
            const result = getReservationsFromTripReport(report, []);
            expect(result).toEqual([]);
        });

        it('should return reservations from tripPayload', () => {
            const report = createRandomReport(1, undefined);
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
            const report = createRandomReport(1, undefined);
            const result = getPNRReservationDataFromTripReport(report, []);
            expect(result).toEqual([]);
        });

        it('should return PNR reservation data from tripPayload', () => {
            const report = createRandomReport(1, undefined);
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
