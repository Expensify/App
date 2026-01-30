/** Represents the structure of TripData. */
type TripData = {
    /** List of Passenger Name Records (PNRs) associated with the trip. */
    pnrs: Pnr[];
    /**
     * Information about the payment for the trip, including the total fare.
     */
    tripPaymentInfo?: {
        /**
         * The total fare for the trip, including the amount and currency code.
         */
        totalFare?: {
            /**
             * The monetary amount of the total fare.
             */
            amount: number;

            /**
             * The currency code for the total fare (e.g., USD, EUR).
             */
            currencyCode: string;
        };
    };
};

/** Represents a Passenger Name Record (PNR). */
type Pnr = {
    /** Unique identifier for the PNR. */
    pnrId: string;

    /** Additional data associated with the PNR. */
    data: PnrData;
};

/**
 *
 */
type PnrTraveler = {
    /** User ID associated with the traveler. */
    userId: {
        /** ID of the user. */
        id: string;
    };

    /** Traveler-specific information. */
    travelerInfo: Record<string, unknown>;

    /** Personal information of the traveler. */
    personalInfo: {
        /** Addresses of the traveler. */
        addresses: unknown[];

        /** Phone numbers of the traveler. */
        phoneNumbers: unknown[];

        /** Email of the traveler. */
        email: string;

        /** Name details of the traveler. */
        name: {
            /** Family name part 1. */
            family1: string;
            /** Family name part 2. */
            family2: string;
            /** Given name. */
            given: string;
            /** Middle name. */
            middle: string;
            /** Preferred name. */
            preferred: string;
        };
    };

    /** Loyalty information for the traveler. */
    loyalties: unknown[];

    /** Persona of the traveler (e.g., EMPLOYEE, GUEST). */
    persona: string;

    /** Business information of the traveler. */
    businessInfo: {
        /** Attributes specified by the company. */
        companySpecifiedAttributes: unknown[];
    };

    /** Tier of the traveler (e.g., loyalty tier). */
    tier: string;
};

/** Represents the structure of PnrData. */
type PnrData = {
    /** Version of the PNR data. */
    version: number;

    /** List of travelers associated with the PNR. */
    travelers: Array<{
        /** Personal information of the traveler. */
        travelerPersonalInfo: {
            /** Loyalty information for the traveler. */
            loyaltyInfos: unknown[];
        };

        /** User information. */
        user: {
            /** List of addresses associated with the user. */
            addresses: unknown[];

            /** Identity documents of the user. */
            identityDocs: unknown[];

            /** Payment information for the user. */
            paymentInfos: unknown[];

            /** Phone numbers of the user. */
            phoneNumbers: unknown[];
        };

        /** Business information of the user. */
        userBusinessInfo: {
            /** Business phone numbers of the user. */
            phoneNumbers: unknown[];

            /** Information about designated approvers. */
            designatedApproverInfos: unknown[];

            /** User IDs of designated approvers. */
            designatedApproverUserIds: unknown[];
        };

        /** Organization ID of the user. */
        userOrgId: Record<string, unknown>;

        /** Persona of the traveler (e.g., EMPLOYEE, GUEST). */
        persona: string;

        /** Indicates if the traveler is active. */
        isActive: boolean;

        /** Tier of the traveler (e.g., loyalty tier). */
        tier: string;

        /** Ad-hoc user information. */
        adhocUserInfo: Record<string, unknown>;

        /** External identifier for the traveler. */
        externalId: string;
    }>;

    /** List of PNR travelers. */
    pnrTravelers: PnrTraveler[];

    /** List of transactions associated with the PNR. */
    transactions: Array<{
        /** Payment request ID for the transaction. */
        paymentReqId: string;

        /** Cost-to-customer details. */
        ctc: unknown[];

        /** Item groups associated with the transaction. */
        itemGroups: unknown[];

        /** Version of the PNR associated with the transaction. */
        pnrVersion: number;

        /** Split payment details. */
        splitPayment: Record<string, unknown>;
    }>;

    /** Air PNR information. */
    airPnr?: AirPnr;

    /** Hotel PNR information. */
    hotelPnr?: HotelPnr;

    /** Car PNR information. */
    carPnr?: CarPnr;

    /** Rail PNR information. */
    railPnr?: RailPnr;

    /** Limo PNR information. */
    limoPnr?: LimoPnr;

    /** Miscellaneous PNR information. */
    miscPnr?: MiscPnr;

    /** Additional metadata for the PNR. */
    additionalMetadata: {
        /** Information about airports. */
        airportInfo: Array<{
            /** Airport code. */
            airportCode: string;
            /** Airport name. */
            airportName: string;
            /** City name. */
            cityName: string;
            /** Country code. */
            countryCode: string;
            /** Country name. */
            countryName: string;
            /** State code. */
            stateCode: string;
            /** Zone name. */
            zoneName: string;
        }>;
        /** Information about airlines. */
        airlineInfo: Array<{
            /** Airline code. */
            airlineCode: string;
            /** Airline name. */
            airlineName: string;
        }>;
    };

    /** Custom fields for the PNR. */
    customFields: Array<{
        /** ID of the custom field. */
        id: string;

        /** Type of the custom field. */
        type: string;

        /** Description of the custom field. */
        description: string;
    }>;

    /** Unique identifier for the trip. */
    tripId: string;

    /** Reason for suspending the booking. */
    suspendReason: string;

    /**
     * Fare Amount details for the PNR.
     */
    totalFareAmount: {
        /**
         * Base fare details.
         */
        base: {
            /**
             * Base fare amount.
             */
            amount: number;
            /**
             * Converted amount of the base fare.
             */
            convertedAmount: number;
            /**
             * Converted currency of the base fare.
             */
            convertedCurrency: string;
            /**
             * Currency code of the base fare.
             */
            currencyCode: string;
        };
        /**
         * Extra taxes paid
         */
        tax: {
            /**
             * Tax amount.
             */
            amount: number;
        };
    };
};

/** Represents the structure of AirPnr. */
type AirPnr = {
    /** List of legs associated with the air PNR. */
    legs: Array<{
        /** Brand name of the leg. */
        brandName: string;
        /** Fare offers for the leg. */
        fareOffers: Array<{
            /** Baggage policy for the fare offer. */
            baggagePolicy?: {
                /** Carry-on baggage details. */
                carryOn?: Array<{
                    /** Description of the carry-on baggage. */
                    description: string;
                }>;
                /** Checked-in baggage details. */
                checkedIn?: Array<{
                    /** Description of the checked-in baggage. */
                    description: string;
                }>;
            };
            /** Cancellation policy for the fare offer. */
            cancellationPolicy?: {
                /** Description of the cancellation policy. */
                description: string;
            };
            /** Exchange policy for the fare offer. */
            exchangePolicy?: {
                /** Description of the exchange policy. */
                description: string;
            };
            /** User ID associated with the fare offer. */
            userId: {
                /** ID of the user. */
                id: string;
            };
        }>;
        /** Flights associated with the leg. */
        flights: Array<{
            /** Amenities provided in the flight. */
            amenities: unknown[];
            /** Arrival date and time of the flight. */
            arrivalDateTime: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Arrival gate details of the flight. */
            arrivalGate: {
                /** Gate number. */
                gate: string;
                /** Terminal number. */
                terminal: string;
            };
            /** Booking code for the flight. */
            bookingCode: string;
            /** Cabin class of the flight. */
            cabin: string;
            /** CO2 emission details for the flight. */
            co2EmissionDetail: {
                /** Average emission value. */
                averageEmissionValue: number;
                /** Emission value. */
                emissionValue: number;
                /** Flight distance in kilometers. */
                flightDistanceKm: number;
                /** Indicates if the emission value is approximate. */
                isApproximate: boolean;
            };
            /** Departure date and time of the flight. */
            departureDateTime: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Departure gate details of the flight. */
            departureGate: {
                /** Gate number. */
                gate: string;
                /** Terminal number. */
                terminal: string;
            };
            /** Destination of the flight. */
            destination: string;
            /** Distance details of the flight. */
            distance: {
                /** Length of the distance. */
                length: number;
                /** Unit of the distance. */
                unit: string;
            };
            /** Duration of the flight. */
            duration: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Equipment details for the flight. */
            equipment: {
                /** Equipment code. */
                code: string;
                /** Equipment name. */
                name: string;
                /** Equipment type. */
                type: string;
            };
            /** Flight ID. */
            flightId: string;
            /** Index of the flight. */
            flightIndex: number;
            /** Status of the flight. */
            flightStatus: string;
            /** Waiver codes for the flight. */
            flightWaiverCodes: unknown[];
            /** Hidden stops for the flight. */
            hiddenStops: unknown[];
            /** Marketing details for the flight. */
            marketing: {
                /** Airline code for marketing. */
                airlineCode: string;
                /** Flight number for marketing. */
                num: string;
            };
            /** Operating details for the flight. */
            operating: {
                /** Airline code for operating. */
                airlineCode: string;
                /** Flight number for operating. */
                num: string;
            };
            /** Operating airline name. */
            operatingAirlineName: string;
            /** Origin of the flight. */
            origin: string;
            /** Other statuses for the flight. */
            otherStatuses: unknown[];
            /** Restrictions for the flight. */
            restrictions: unknown[];
            /** Source status of the flight. */
            sourceStatus: string;
            /** Vendor confirmation number for the flight. */
            vendorConfirmationNumber: string;
        }>;
        /** Leg ID. */
        legId: string;
        /** Index of the leg. */
        legIndex: number;
        /** Status of the leg. */
        legStatus: string;
        /** Preferences for the leg. */
        preferences: unknown[];
        /** Preferred types for the leg. */
        preferredTypes: unknown[];
        /** Rate type for the leg. */
        rateType: string;
        /** Sorting priority for the leg. */
        sortingPriority: number;
        /** Traveler restrictions for the leg. */
        travelerRestrictions: unknown[];
        /** Validating airline code for the leg. */
        validatingAirlineCode: string;
    }>;

    /** Remarks associated with the air PNR. */
    airPnrRemarks: Array<Record<string, unknown>>;

    /** Traveler information for the air PNR. */
    travelerInfos: Array<{
        /** Air vendor cancellation information. */
        airVendorCancellationInfo: {
            /** Air vendor cancellation objects. */
            airVendorCancellationObjects: unknown[];
        };
        /** Applied credits for the traveler. */
        appliedCredits: unknown[];
        /** Boarding pass details for the traveler. */
        boardingPass: unknown[];
        /** Booking details for the traveler. */
        booking: {
            /** Itinerary details for the booking. */
            itinerary: {
                /** Fare components for the itinerary. */
                fareComponents: Array<{
                    /** Base fare details. */
                    baseFare: {
                        /** Amount of the base fare. */
                        amount: number;
                        /** Converted amount of the base fare. */
                        convertedAmount: number;
                        /** Converted currency of the base fare. */
                        convertedCurrency: string;
                        /** Currency code of the base fare. */
                        currencyCode: string;
                        /** Other coinage details for the base fare. */
                        otherCoinage: unknown[];
                    };
                    /** Fare basis code for the component. */
                    fareBasisCode: string;
                    /** Flight IDs associated with the component. */
                    flightIds: Array<{
                        /** Index of the flight. */
                        flightIdx: number;
                        /** Index of the leg. */
                        legIdx: number;
                    }>;
                    /** Ticket designator for the component. */
                    ticketDesignator: string;
                    /** Tour code for the component. */
                    tourCode: string;
                }>;
                /** Flight fare breakup details. */
                flightFareBreakup: Array<{
                    /** Flights fare details. */
                    flightsFare: {
                        /** Base fare details. */
                        base: {
                            /** Amount of the base fare. */
                            amount: number;
                            /** Converted amount of the base fare. */
                            convertedAmount: number;
                            /** Converted currency of the base fare. */
                            convertedCurrency: string;
                            /** Currency code of the base fare. */
                            currencyCode: string;
                            /** Other coinage details for the base fare. */
                            otherCoinage: unknown[];
                        };
                        /** Tax details for the flights fare. */
                        tax: {
                            /** Amount of the tax. */
                            amount: number;
                            /** Converted amount of the tax. */
                            convertedAmount: number;
                            /** Converted currency of the tax. */
                            convertedCurrency: string;
                            /** Currency code of the tax. */
                            currencyCode: string;
                            /** Other coinage details for the tax. */
                            otherCoinage: unknown[];
                        };
                    };
                    /** Leg indices associated with the breakup. */
                    legIndices: number[];
                }>;
                /** Other ancillary fares for the itinerary. */
                otherAncillaryFares: unknown[];
                /** Total fare details for the itinerary. */
                totalFare: {
                    /** Base fare details. */
                    base: {
                        /** Amount of the base fare. */
                        amount: number;
                        /** Converted amount of the base fare. */
                        convertedAmount: number;
                        /** Converted currency of the base fare. */
                        convertedCurrency: string;
                        /** Currency code of the base fare. */
                        currencyCode: string;
                        /** Other coinage details for the base fare. */
                        otherCoinage: unknown[];
                    };
                    /** Tax details for the total fare. */
                    tax: {
                        /** Amount of the tax. */
                        amount: number;
                        /** Converted amount of the tax. */
                        convertedAmount: number;
                        /** Converted currency of the tax. */
                        convertedCurrency: string;
                        /** Currency code of the tax. */
                        currencyCode: string;
                        /** Other coinage details for the tax. */
                        otherCoinage: unknown[];
                    };
                };
                /** Total flights fare details. */
                totalFlightsFare: {
                    /** Base fare details. */
                    base: {
                        /** Amount of the base fare. */
                        amount: number;
                        /** Converted amount of the base fare. */
                        convertedAmount: number;
                        /** Converted currency of the base fare. */
                        convertedCurrency: string;
                        /** Currency code of the base fare. */
                        currencyCode: string;
                        /** Other coinage details for the base fare. */
                        otherCoinage: unknown[];
                    };
                    /** Tax details for the total flights fare. */
                    tax: {
                        /** Amount of the tax. */
                        amount: number;
                        /** Converted amount of the tax. */
                        convertedAmount: number;
                        /** Converted currency of the tax. */
                        convertedCurrency: string;
                        /** Currency code of the tax. */
                        currencyCode: string;
                        /** Other coinage details for the tax. */
                        otherCoinage: unknown[];
                    };
                };
            };
            /** Luggage details for the booking. */
            luggageDetails: unknown[];
            /** Other ancillaries for the booking. */
            otherAncillaries: unknown[];
            /** Other charges for the booking. */
            otherCharges: unknown[];
            /** Seats details for the booking. */
            seats: Array<{
                /** Index of the leg. */
                legIdx: number;
                /** Index of the flight. */
                flightIdx: number;
                /** Amount for the seat. */
                amount: number;
                /** Number of the seat (e.g., "12A", "7F"). */
                number: string;
            }>;
        };
        /** Passenger type for the traveler. */
        paxType: string;
        /** Special service request information for the traveler. */
        specialServiceRequestInfos: unknown[];
        /** Tickets associated with the traveler. */
        tickets: Array<{
            /** Amount details for the ticket. */
            amount: {
                /** Base fare details. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Tax details for the ticket. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
            };
            /** Ancillaries associated with the ticket. */
            ancillaries: unknown[];
            /** Commission details for the ticket. */
            commission: {
                /** Amount details for the commission. */
                amount: {
                    /** Amount of the commission. */
                    amount: number;
                    /** Converted amount of the commission. */
                    convertedAmount: number;
                    /** Converted currency of the commission. */
                    convertedCurrency: string;
                    /** Currency code of the commission. */
                    currencyCode: string;
                    /** Other coinage details for the commission. */
                    otherCoinage: unknown[];
                };
                /** Percentage of the commission. */
                percent: number;
            };
            /** Conjunction ticket suffix for the ticket. */
            conjunctionTicketSuffix: unknown[];
            /** Exchange policy for the ticket. */
            exchangePolicy: {
                /** Exchange penalty details. */
                exchangePenalty?: {
                    /** Amount of the exchange penalty. */
                    amount: number;
                    /** Converted amount of the exchange penalty. */
                    convertedAmount: number;
                    /** Converted currency of the exchange penalty. */
                    convertedCurrency: string;
                    /** Currency code of the exchange penalty. */
                    currencyCode: string;
                    /** Other coinage details for the exchange penalty. */
                    otherCoinage: unknown[];
                };
                /** Indicates if the exchange policy is Cat16. */
                isCat16: boolean;
                /** Indicates if the exchange policy is conditional. */
                isConditional: boolean;
                /** Indicates if the ticket is exchangeable. */
                isExchangeable: boolean;
            };
            /** Fare calculation details for the ticket. */
            fareCalculation: string;
            /** Flight coupons associated with the ticket. */
            flightCoupons: Array<{
                /** Index of the flight. */
                flightIdx: number;
                /** Index of the leg. */
                legIdx: number;
                /** Status of the flight coupon. */
                status: string;
            }>;
            /** IATA number for the ticket. */
            iataNumber: string;
            /** Issued date and time for the ticket. */
            issuedDateTime: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Payment details for the ticket. */
            paymentDetails: Array<{
                /** Amount details for the payment. */
                amount: {
                    /** Base fare details. */
                    base: {
                        /** Amount of the base fare. */
                        amount: number;
                        /** Converted amount of the base fare. */
                        convertedAmount: number;
                        /** Converted currency of the base fare. */
                        convertedCurrency: string;
                        /** Currency code of the base fare. */
                        currencyCode: string;
                        /** Other coinage details for the base fare. */
                        otherCoinage: unknown[];
                    };
                    /** Tax details for the payment. */
                    tax: {
                        /** Amount of the tax. */
                        amount: number;
                        /** Converted amount of the tax. */
                        convertedAmount: number;
                        /** Converted currency of the tax. */
                        convertedCurrency: string;
                        /** Currency code of the tax. */
                        currencyCode: string;
                        /** Other coinage details for the tax. */
                        otherCoinage: unknown[];
                    };
                };
                /** Form of payment details. */
                fop: {
                    /** Access type details for the payment. */
                    accessType: {
                        /** Type of access. */
                        accessType: string;
                        /** Entities associated with the access. */
                        entities: Array<{
                            /** Central card access level. */
                            centralCardAccessLevel: string;
                            /** Entity ID. */
                            entityId: string;
                        }>;
                        /** Entity IDs associated with the access. */
                        entityIds: string[];
                    };
                    /** Additional information for the payment. */
                    additionalInfo: string;
                    /** Card details for the payment. */
                    card: {
                        /** Address details for the card. */
                        address: {
                            /** Address lines. */
                            addressLines: string[];
                            /** Administrative area. */
                            administrativeArea: string;
                            /** Administrative area name. */
                            administrativeAreaName: string;
                            /** Continent code. */
                            continentCode: string;
                            /** Description of the address. */
                            description: string;
                            /** Indicates if the address is default. */
                            isDefault: boolean;
                            /** Language code for the address. */
                            languageCode: string;
                            /** Locality of the address. */
                            locality: string;
                            /** Location code for the address. */
                            locationCode: string;
                            /** Organization associated with the address. */
                            organization: string;
                            /** Postal code for the address. */
                            postalCode: string;
                            /** Recipients associated with the address. */
                            recipients: unknown[];
                            /** Region code for the address. */
                            regionCode: string;
                            /** Region name for the address. */
                            regionName: string;
                            /** Revision number for the address. */
                            revision: number;
                            /** Sorting code for the address. */
                            sortingCode: string;
                            /** Sublocality of the address. */
                            sublocality: string;
                            /** Timezone for the address. */
                            timezone: string;
                        };
                        /** Company associated with the card. */
                        company: string;
                        /** Currency associated with the card. */
                        currency: string;
                        /** CVV of the card. */
                        cvv: string;
                        /** Expiry month of the card. */
                        expiryMonth: number;
                        /** Expiry year of the card. */
                        expiryYear: number;
                        /** External ID of the card. */
                        externalId: string;
                        /** ID of the card. */
                        id: string;
                        /** Label of the card. */
                        label: string;
                        /** Name on the card. */
                        name: string;
                        /** Number of the card. */
                        number: string;
                        /** Type of the card. */
                        type: string;
                    };
                    /** Payment method for the payment. */
                    paymentMethod: string;
                    /** Type of the payment. */
                    type: string;
                };
                /** Indicates if the payment is refunded. */
                isRefunded: boolean;
            }>;
            /** PCC associated with the ticket. */
            pcc: string;
            /** Published fare details for the ticket. */
            publishedFare: {
                /** Base fare details. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Tax details for the published fare. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
            };
            /** Refund policy for the ticket. */
            refundPolicy: {
                /** Indicates if the refund policy is Cat16. */
                isCat16: boolean;
                /** Indicates if the refund policy is conditional. */
                isConditional: boolean;
                /** Indicates if the ticket is refundable. */
                isRefundable: boolean;
                /** Indicates if the ticket is refundable by OBT. */
                isRefundableByObt: boolean;
            };
            /** Status of the ticket. */
            status: string;
            /** Tax breakdown details for the ticket. */
            taxBreakdown: {
                /** Tax details for the ticket. */
                tax: Array<{
                    /** Amount details for the tax. */
                    amount: {
                        /** Amount of the tax. */
                        amount: number;
                        /** Converted amount of the tax. */
                        convertedAmount: number;
                        /** Converted currency of the tax. */
                        convertedCurrency: string;
                        /** Currency code of the tax. */
                        currencyCode: string;
                        /** Other coinage details for the tax. */
                        otherCoinage: unknown[];
                    };
                    /** Tax code for the tax. */
                    taxCode: string;
                }>;
            };
            /** Ticket incomplete reasons for the ticket. */
            ticketIncompleteReasons: unknown[];
            /** Ticket number for the ticket. */
            ticketNumber: string;
            /** Ticket settlement details for the ticket. */
            ticketSettlement: string;
            /** Ticket type for the ticket. */
            ticketType: string;
            /** Validating airline code for the ticket. */
            validatingAirlineCode: string;
            /** Vendor cancellation ID for the ticket. */
            vendorCancellationId: string;
        }>;
        /** Index of the traveler. */
        travelerIdx: number;
        /** User ID associated with the traveler. */
        userId: {
            /** ID of the user. */
            id: string;
        };
    }>;

    /** Automated cancellation information for the air PNR. */
    automatedCancellationInfo: {
        /** Supported cancellation options for the air PNR. */
        supportedCancellations: Array<Record<string, unknown>>;
    };

    /** Automated exchange information for the air PNR. */
    automatedExchangeInfo: {
        /** Supported exchange options for the air PNR. */
        supportedExchanges: Array<Record<string, unknown>>;
    };

    /** Booking metadata for the air PNR. */
    bookingMetadata: {
        /** Fare statistics for the air PNR. */
        fareStatistics: {
            /** Statistics items related to fares. */
            statisticsItems: unknown[];
        };
    };

    /** Other service information for the air PNR. */
    otherServiceInfos: Array<{
        /** Indexes of flights associated with other services. */
        flightIndexes: unknown[];
    }>;

    /** Hold deadline information for the air PNR. */
    holdDeadline: {
        /** Deadline for holding the booking. */
        holdDeadline: Record<string, unknown>;
    };

    /** Air price optimization metadata for the air PNR. */
    airPriceOptimizationMetadata: {
        /** List of old tickets before optimization. */
        oldTickets: unknown[];

        /** List of new tickets after optimization. */
        newTickets: unknown[];

        /** Old PNR ID before optimization. */
        oldPnrId: string;

        /** New PNR ID after optimization. */
        newPnrId: string;

        /** Old price details for the air PNR. */
        oldPrice: {
            /** Additional coinage details for the old price. */
            otherCoinage: unknown[];
        };

        /** New price details for the air PNR. */
        newPrice: {
            /** Additional coinage details for the new price. */
            otherCoinage: unknown[];
        };

        /** Price drop details for the air PNR. */
        priceDrop: {
            /** Additional coinage details for the price drop. */
            otherCoinage: unknown[];
        };

        /** Penalty price details for the air PNR. */
        penaltyPrice: {
            /** Additional coinage details for the penalty price. */
            otherCoinage: unknown[];
        };
    };

    /** Details of disrupted flights for the air PNR. */
    disruptedFlightDetails: Array<Record<string, unknown>>;
};

/** Represents the structure of HotelPnr. */
type HotelPnr = {
    /** Check-in date and time for the hotel booking. */
    checkInDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };
    /** Check-out date and time for the hotel booking. */
    checkOutDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };
    /** Hotel information for the booking. */
    hotelInfo: {
        /** Additional amenities provided by the hotel. */
        additionalAmenities: unknown[];
        /** Address details of the hotel. */
        address: {
            /** Address lines. */
            addressLines: string[];
            /** Administrative area. */
            administrativeArea: string;
            /** Administrative area name. */
            administrativeAreaName: string;
            /** Continent code. */
            continentCode: string;
            /** Description of the address. */
            description: string;
            /** Indicates if the address is default. */
            isDefault: boolean;
            /** Language code for the address. */
            languageCode: string;
            /** Locality of the address. */
            locality: string;
            /** Location code for the address. */
            locationCode: string;
            /** Organization associated with the address. */
            organization: string;
            /** Postal code for the address. */
            postalCode: string;
            /** Recipients associated with the address. */
            recipients: unknown[];
            /** Region code for the address. */
            regionCode: string;
            /** Region name for the address. */
            regionName: string;
            /** Revision number for the address. */
            revision: number;
            /** Sorting code for the address. */
            sortingCode: string;
            /** Sublocality of the address. */
            sublocality: string;
            /** Timezone for the address. */
            timezone: string;
        };
        /** Amenities provided by the hotel. */
        amenities: Array<{
            /** Additional information about the amenity. */
            additionalInfo: string;
            /** Indicates if the amenity is complimentary. */
            complimentary: boolean;
            /** Type of the amenity. */
            type: string;
        }>;
        /** Brand name of the hotel. */
        brandName: string;
        /** Chain code of the hotel. */
        chainCode: string;
        /** Chain name of the hotel. */
        chainName: string;
        /** Coordinates of the hotel location. */
        coordinates: {
            /** Latitude of the hotel location. */
            latitude: number;
            /** Longitude of the hotel location. */
            longitude: number;
        };
        /** Descriptions of the hotel. */
        descriptions: unknown[];
        /** Email address of the hotel. */
        email: string;
        /** Fax details of the hotel. */
        fax: Array<{
            /** Country code for the fax number. */
            countryCode: number;
            /** Source of the country code. */
            countryCodeSource: string;
            /** Extension of the fax number. */
            extension: string;
            /** ISO country code for the fax number. */
            isoCountryCode: string;
            /** Indicates if the fax number has an Italian leading zero. */
            italianLeadingZero: boolean;
            /** National number of the fax. */
            nationalNumber: number;
            /** Number of leading zeros in the fax number. */
            numberOfLeadingZeros: number;
            /** Preferred domestic carrier code for the fax. */
            preferredDomesticCarrierCode: string;
            /** Raw input of the fax number. */
            rawInput: string;
            /** Type of the fax number. */
            type: string;
        }>;
        /** Hotel ID. */
        hotelId: string;
        /** Image sets for the hotel. */
        imageSets: Array<{
            /** Category of the image set. */
            category: string;
            /** Image group details. */
            imageGroup: {
                /** Caption for the image group. */
                caption: string;
                /** Images in the image group. */
                images: Array<{
                    /** Data of the image. */
                    data: string;
                    /** Dimensions of the image. */
                    dimensions: {
                        /** Height of the image. */
                        height: number;
                        /** Width of the image. */
                        width: number;
                    };
                    /** URL of the image. */
                    url: string;
                }>;
            };
        }>;
        /** Master chain code of the hotel. */
        masterChainCode: string;
        /** Name of the hotel. */
        name: string;
        /** Phone details of the hotel. */
        phone: {
            /** Country code for the phone number. */
            countryCode: number;
            /** Source of the country code. */
            countryCodeSource: string;
            /** Extension of the phone number. */
            extension: string;
            /** ISO country code for the phone number. */
            isoCountryCode: string;
            /** Indicates if the phone number has an Italian leading zero. */
            italianLeadingZero: boolean;
            /** National number of the phone. */
            nationalNumber: number;
            /** Number of leading zeros in the phone number. */
            numberOfLeadingZeros: number;
            /** Preferred domestic carrier code for the phone. */
            preferredDomesticCarrierCode: string;
            /** Raw input of the phone number. */
            rawInput: string;
            /** Type of the phone number. */
            type: string;
        };
        /** Star rating of the hotel. */
        starRating: number;
        /** Third-party hotel codes. */
        thirdPartyHotelCodes: Array<{
            /** Hotel code. */
            hotelCode: string;
            /** Type of the hotel code. */
            hotelCodeType: string;
        }>;
    };
    /** Special requests for the hotel booking. */
    hotelSpecialRequests: {
        /** Accessible features requested. */
        accessibleFeatures: unknown[];
        /** Additional note for the booking. */
        additionalNote: string;
        /** Flight number associated with the booking. */
        flightNumber: string;
        /** Room features requested. */
        roomFeatures: unknown[];
        /** Room locations requested. */
        roomLocations: unknown[];
    };
    /** Number of rooms booked. */
    numberOfRooms: number;
    /** Occupancy details for the booking. */
    occupancy: Array<{
        /** Ages of children in the booking. */
        childAges: unknown[];
        /** Number of adults in the booking. */
        numAdults: number;
        /** Number of children in the booking. */
        numChildren: number;
        /** Number of infants in the booking. */
        numInfants: number;
    }>;
    /** Payment details for the booking. */
    payment: {
        /** Description of the payment. */
        description: string;
        /** Type of payment. */
        paymentType: string;
    };
    /** Status of the hotel PNR. */
    pnrStatus: string;
    /** Preferences for the booking. */
    preferences: Array<{
        /** Reason for blocking the preference. */
        blockedReason: string;
        /** Label of the preference. */
        label: string;
        /** Type of the preference. */
        preferredType: string;
    }>;
    /** Preferred types for the booking. */
    preferredType: string[];
    /** Room details for the booking. */
    room: {
        /** Additional amenities provided in the room. */
        additionalAmenities: unknown[];
        /** Additional details for the room. */
        additionalDetails: Array<{
            /** Type of the additional detail. */
            additionalDetailType: string;
            /** Text of the additional detail. */
            text: string;
        }>;
        /** Amenities provided in the room. */
        amenities: Array<{
            /** Additional information about the amenity. */
            additionalInfo: string;
            /** Indicates if the amenity is complimentary. */
            complimentary: boolean;
            /** Type of the amenity. */
            type: string;
        }>;
        /** Number of beds in the room. */
        bedCount: number;
        /** Type of bed in the room. */
        bedType: string;
        /** Cancellation policy for the room. */
        cancellationPolicy: {
            /** Deadline for the cancellation. */
            deadline: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Deadline in UTC for the cancellation. */
            deadlineUtc: {
                /** ISO 8601 format. */
                iso8601: string;
            };
            /** Policy details for the cancellation. */
            policy: string;
        };
        /** Guarantee type for the room. */
        guaranteeType: string;
        /** Image sets for the room. */
        imageSets: unknown[];
        /** Meals provided in the room. */
        meals: {
            /** Meal plan for the room. */
            mealPlan: string;
            /** Meals included in the room. */
            mealsIncluded: string[];
        };
        /** Rate information for the room. */
        rateInfo: {
            /** Indicates if the form of payment is modifiable. */
            isFopModifiable: boolean;
            /** Indicates if the rate is modifiable. */
            isModifiable: boolean;
            /** Nightly rate details for the room. */
            nightlyRate: {
                /** Amount of the nightly rate. */
                amount: number;
                /** Converted amount of the nightly rate. */
                convertedAmount: number;
                /** Converted currency of the nightly rate. */
                convertedCurrency: string;
                /** Currency code of the nightly rate. */
                currencyCode: string;
                /** Other coinage details for the nightly rate. */
                otherCoinage: unknown[];
            };
            /** Nightly rates for the room. */
            nightlyRates: Array<{
                /** Base fare details for the nightly rate. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Extras for the nightly rate. */
                extras: unknown[];
                /** Indicates if the nightly rate includes commission. */
                includesCommission: boolean;
                /** Tax details for the nightly rate. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
            }>;
            /** Postpaid rate details for the room. */
            postpaidRate: {
                /** Base fare details for the postpaid rate. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Extras for the postpaid rate. */
                extras: unknown[];
                /** Indicates if the postpaid rate includes commission. */
                includesCommission: boolean;
                /** Tax details for the postpaid rate. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
            };
            /** Prepaid rate details for the room. */
            prepaidRate: {
                /** Base fare details for the prepaid rate. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Extras for the prepaid rate. */
                extras: unknown[];
                /** Indicates if the prepaid rate includes commission. */
                includesCommission: boolean;
                /** Tax details for the prepaid rate. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
            };
            /** Rate code for the room. */
            rateCode: string;
            /** Rate type for the room. */
            rateType: string;
            /** Total rate details for the room. */
            totalRate: {
                /** Base fare details for the total rate. */
                base: {
                    /** Amount of the base fare. */
                    amount: number;
                    /** Converted amount of the base fare. */
                    convertedAmount: number;
                    /** Converted currency of the base fare. */
                    convertedCurrency: string;
                    /** Currency code of the base fare. */
                    currencyCode: string;
                    /** Other coinage details for the base fare. */
                    otherCoinage: unknown[];
                };
                /** Commission details for the total rate. */
                commission: {
                    /** Amount details for the commission. */
                    amount: {
                        /** Amount of the commission. */
                        amount: number;
                        /** Converted amount of the commission. */
                        convertedAmount: number;
                        /** Converted currency of the commission. */
                        convertedCurrency: string;
                        /** Currency code of the commission. */
                        currencyCode: string;
                        /** Other coinage details for the commission. */
                        otherCoinage: unknown[];
                    };
                    /** Percentage of the commission. */
                    percent: number;
                };
                /** Extras for the total rate. */
                extras: unknown[];
                /** Indicates if the total rate includes commission. */
                includesCommission: boolean;
                /** Tax details for the total rate. */
                tax: {
                    /** Amount of the tax. */
                    amount: number;
                    /** Converted amount of the tax. */
                    convertedAmount: number;
                    /** Converted currency of the tax. */
                    convertedCurrency: string;
                    /** Currency code of the tax. */
                    currencyCode: string;
                    /** Other coinage details for the tax. */
                    otherCoinage: unknown[];
                };
                /** Tax breakdown details for the total rate. */
                taxBreakdown: {
                    /** Tax details for the total rate. */
                    tax: unknown[];
                };
                /** Transaction date for the total rate. */
                transactionDate: {
                    /** ISO 8601 format. */
                    iso8601: string;
                };
            };
        };
        /** Room information details. */
        roomInfo: {
            /** Type of the room. */
            roomType: string;
            /** Room type code. */
            roomTypeCode: string;
            /** Type class description for the room. */
            typeClassDescription: string;
        };
        /** Name of the room. */
        roomName: string;
    };
    /** Sorting priority for the booking. */
    sortingPriority: number;
    /** Source status of the booking. */
    sourceStatus: string;
    /** Traveler information for the booking. */
    travelerInfos: Array<{
        /** Loyalty information for the traveler. */
        loyaltyInfos: unknown[];
        /** Index of the traveler. */
        travelerIdx: number;
        /** User ID associated with the traveler. */
        userId: {
            /** ID of the user. */
            id: string;
        };
    }>;
    /** Vendor cancellation ID for the booking. */
    vendorCancellationId: string;
    /** Vendor confirmation number for the booking. */
    vendorConfirmationNumber: string;
    /** Vendor reference ID for the booking. */
    vendorReferenceId: string;
};

/** Represents the structure of CarPnr. */
type CarPnr = {
    /** Cancellation policy for the car booking. */
    cancellationPolicy: {
        /** Policy details for the car booking. */
        policy: string;

        /** Deadline for the car booking. */
        deadline: {
            /** ISO 8601 format. */
            iso8601: string;
        };
    };

    /** Car information for the car booking. */
    carInfo: {
        /** Specifications of the car. */
        carSpec: {
            /** Display name of the car. */
            displayName: string;
            /** Engine type of the car. */
            engineType: string;
        };

        /** Drop-off location details. */
        dropOffLocation: {
            /** Address details for the drop-off location. */
            address: {
                /** Address lines for the drop-off location. */
                addressLines: string[];
                /** Administrative area for the drop-off location. */
                administrativeArea: string;
                /** Administrative area name for the drop-off location. */
                administrativeAreaName: string;
                /** Continent code for the drop-off location. */
                continentCode: string;
                /** Description of the drop-off location. */
                description: string;
                /** Indicates if the drop-off location is default. */
                isDefault: boolean;
                /** Language code for the drop-off location. */
                languageCode: string;
                /** Locality of the drop-off location. */
                locality: string;
                /** Location code for the drop-off location. */
                locationCode: string;
                /** Organization associated with the drop-off location. */
                organization: string;
                /** Postal code for the drop-off location. */
                postalCode: string;
                /** Recipients associated with the drop-off location. */
                recipients: unknown[];
                /** Region code for the drop-off location. */
                regionCode: string;
                /** Region name for the drop-off location. */
                regionName: string;
                /** Revision number for the drop-off location. */
                revision: number;
                /** Sorting code for the drop-off location. */
                sortingCode: string;
                /** Sublocality of the drop-off location. */
                sublocality: string;
                /** Timezone for the drop-off location. */
                timezone: string;
            };
        };

        /** Mileage allowance for the car booking. */
        mileageAllowance: Record<string, unknown>;

        /** Pickup location details. */
        pickupLocation: {
            /** Address details for the drop-off location. */
            address: {
                /** Address lines for the pickup location. */
                addressLines: string[];
                /** Administrative area for the pickup location. */
                administrativeArea: string;
                /** Administrative area name for the pickup location. */
                administrativeAreaName: string;
                /** Continent code for the pickup location. */
                continentCode: string;
                /** Description of the pickup location. */
                description: string;
                /** Indicates if the pickup location is default. */
                isDefault: boolean;
                /** Language code for the pickup location. */
                languageCode: string;
                /** Locality of the pickup location. */
                locality: string;
                /** Location code for the pickup location. */
                locationCode: string;
                /** Organization associated with the pickup location. */
                organization: string;
                /** Postal code for the pickup location. */
                postalCode: string;
                /** Recipients associated with the pickup location. */
                recipients: unknown[];
                /** Region code for the pickup location. */
                regionCode: string;
                /** Region name for the pickup location. */
                regionName: string;
                /** Revision number for the pickup location. */
                revision: number;
                /** Sorting code for the pickup location. */
                sortingCode: string;
                /** Sublocality of the pickup location. */
                sublocality: string;
                /** Timezone for the pickup location. */
                timezone: string;
            };
        };

        /** Vendor details for the car booking. */
        vendor: {
            /** Code of the vendor. */
            code: string;
            /** Name of the vendor. */
            name: string;
        };

        /** Code representing the type of car. */
        carTypeCode: string;

        /** Extra mileage charge details. */
        extraMileageCharge: {
            /** Additional coinage details for the extra mileage charge. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Preferred type for the car booking. */
        preferredType: string[];

        /** Preferences for the car booking. */
        preferences: Array<Record<string, unknown>>;

        /** CO2 emission details for the car. */
        co2EmissionDetail: Record<string, unknown>;
    };

    /** Drop-off date and time in ISO 8601 format. */
    dropOffDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };

    /** Type of payment for the car booking. */
    paymentType: string;

    /** Pickup date and time in ISO 8601 format. */
    pickupDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };

    /** Status of the car PNR. */
    pnrStatus: string;

    /** Rate information for the car booking. */
    rate: {
        /** Base rate for the car booking. */
        base: {
            /** Additional coinage details for the base rate. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Extra charges for the car booking. */
        extras: Array<Record<string, unknown>>;

        /** Refund details for the car booking. */
        refund: {
            /** Additional coinage details for the refund. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Tax details for the car booking. */
        tax: {
            /** Additional coinage details for the tax. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Commission details for the car booking. */
        commission: Record<string, unknown>;

        /** Indicates if the rate includes commission. */
        includesCommission: boolean;

        /** Breakdown of taxes for the car booking. */
        taxBreakdown: {
            /** Tax details for the car booking. */
            tax: Array<Record<string, unknown>>;
        };

        /** Transaction date for the car booking. */
        transactionDate: Record<string, unknown>;

        /** Refund information for the car booking. */
        refundInfo: Record<string, unknown>;
    };

    /** Vendor confirmation number for the car booking. */
    vendorConfirmationNumber: string;

    /** Sorting priority for the car booking. */
    sortingPriority: number;

    /** Corporate ID associated with the car booking. */
    corporateId: string;

    /** Rate type for the car booking. */
    rateType: string;

    /** Source status of the car booking. */
    sourceStatus: string;

    /** Vendor cancellation ID for the car booking. */
    vendorCancellationId: string;

    /** Original car search information for the car booking. */
    originalCarSearchInfo: {
        /** Pickup details for the original car search. */
        pickup: Record<string, unknown>;

        /** Drop-off details for the original car search. */
        dropOff: Record<string, unknown>;
    };

    /** Rate metadata for the car booking. */
    rateMetadata: {
        /** Type of negotiated rate for the car booking. */
        negotiatedRateType: string;

        /** Published rate details for the car booking. */
        publishedRate: Record<string, unknown>;

        /** TMC negotiated rate details for the car booking. */
        tmcNegotiatedRate: Record<string, unknown>;

        /** Corporate negotiated rate details for the car booking. */
        corporateNegotiatedRate: Record<string, unknown>;
    };

    /** Rebook reference information for the car booking. */
    rebookReference: {
        /** List of cancelled PNR IDs for re-booking. */
        cancelledPnrIds: Array<Record<string, unknown>>;

        /** Rebooked PNR ID. */
        rebookedPnrId: string;
    };

    /** Daily rates for the car booking. */
    dailyRates: Array<Record<string, unknown>>;
};

/** Represents the structure of RailPnr. */
type RailPnr = {
    /** Details of the inward journey. */
    inwardJourney: {
        /** Status of the inward journey. */
        journeyStatus: string;

        /** Legs associated with the inward journey. */
        legs: Array<Record<string, unknown>>;

        /** CO2 emission details for the inward journey. */
        co2EmissionDetails: Record<string, unknown>;

        /** Sorting priority for the inward journey. */
        sortingPriority: number;

        /** Fare composition for the inward journey. */
        fareComposition: string;

        /** User-facing status for the inward journey. */
        userFacingStatus: string;
    };

    /** Leg information for the rail booking. */
    legInfos: Array<{
        /** Allocated spaces for the leg. */
        allocatedSpaces: Array<{
            /** Seat */
            seatNumber: string;
            /** Coach */
            coachNumber: string;
        }>;
        /** Amenities available for the leg. */
        amenities: unknown[];
        /** Arrival time in ISO 8601 format. */
        arriveAt: {
            /** ISO 8601 format. */
            iso8601: string;
        };
        /** Local arrival time in ISO 8601 format. */
        arriveAtLocal: {
            /** ISO 8601 format. */
            iso8601: string;
        };
        /** Carrier confirmation number. */
        carrierConfirmationNumber: string;
        /** CO2 emission in grams per passenger. */
        co2EmissionGramsPerPassenger: number;
        /** Departure time in ISO 8601 format. */
        departAt: {
            /** ISO 8601 format. */
            iso8601: string;
        };
        /** Local departure time in ISO 8601 format. */
        departAtLocal: {
            /** ISO 8601 format. */
            iso8601: string;
        };
        /** Destination of the leg. */
        destination: string;
        /** Information about the destination. */
        destinationInfo: {
            /** City code of the destination. */
            cityCode: string;
            /** City name of the destination. */
            cityName: string;
            /** Code of the destination station. */
            code: string;
            /** Continent code of the destination. */
            continentCode: string;
            /** Country code of the destination. */
            countryCode: string;
            /** Latitude and longitude of the destination. */
            latLong: {
                /** Latitude of the destination. */
                latitude: number;
                /** Longitude of the destination. */
                longitude: number;
            };
            /** Local code of the destination. */
            localCode: string;
            /** Name of the destination station. */
            name: string;
            /** Source reference information for the destination. */
            sourceRefInfos: Array<{
                /** Name of the inventory. */
                inventoryName: string;
                /** Station reference ID. */
                stationReferenceId: string;
            }>;
            /** State code of the destination. */
            stateCode: string;
            /** Type of the destination station. */
            stationType: string;
            /** Time zone of the destination. */
            timeZone: string;
        };
        /** Distance details for the leg. */
        distance: {
            /** Length of the distance. */
            length: number;
            /** Unit of the distance. */
            unit: string;
        };
        /** Duration of the leg in ISO 8601 format. */
        duration: {
            /** ISO 8601 format. */
            iso8601: string;
        };
        /** Fare type for the leg. */
        fareType: string;
        /** Unique identifier for the leg. */
        legId: string;
        /** Origin of the leg. */
        origin: string;
        /** Information about the origin. */
        originInfo: {
            /** City code of the origin. */
            cityCode: string;
            /** City name of the origin. */
            cityName: string;
            /** Code of the origin station. */
            code: string;
            /** Continent code of the origin. */
            continentCode: string;
            /** Country code of the origin. */
            countryCode: string;
            /** Latitude and longitude of the origin. */
            latLong: {
                /** Latitude of the origin. */
                latitude: number;
                /** Longitude of the origin. */
                longitude: number;
            };
            /** Local code of the origin. */
            localCode: string;
            /** Name of the origin station. */
            name: string;
            /** Source reference information for the origin. */
            sourceRefInfos: Array<{
                /** Name of the inventory. */
                inventoryName: string;
                /** Station reference ID. */
                stationReferenceId: string;
            }>;
            /** State code of the origin. */
            stateCode: string;
            /** Type of the origin station. */
            stationType: string;
            /** Time zone of the origin. */
            timeZone: string;
        };
        /** Rail fare type details. */
        railFareType: {
            /** Description of the rail fare type. */
            description: string;
            /** Fare details for the rail fare type. */
            fareDetails: Array<{
                /** Description of the fare detail. */
                description: string;
                /** Name of the fare detail. */
                name: string;
            }>;
            /** Summary of the rail fare type. */
            fareSummary: string;
        };
        /** Seat preference selection details. */
        seatPreferenceSelection: {
            /** Type of carriage. */
            carriageType: string;
            /** Type of deck. */
            deckType: string;
            /** Direction of the seat. */
            direction: string;
            /** Facilities available for the seat. */
            facilities: unknown[];
            /** Position type of the seat. */
            positionType: string;
            /** Location type of the seat. */
            seatLocationType: string;
            /** Type of the seat. */
            seatType: string;
        };
        /** Ticket number for the leg. */
        ticketNumber: string;
        /** Travel class for the leg. */
        travelClass: string;
        /** Rail information for the traveler. */
        travelerRailInfo: unknown[];
        /** Vehicle details for the leg. */
        vehicle: {
            /** Name of the carrier. */
            carrierName: string;
            /** Timetable ID for the vehicle. */
            timetableId: string;
            /** Name of the transport. */
            transportName: string;
            /** Type of the vehicle. */
            type: string;
        };
        /** Name of the vendor. */
        vendorName: string;
    }>;

    /** Details of the outward journey. */
    outwardJourney: {
        /** Status of the outward journey. */
        journeyStatus: string;

        /** Legs associated with the outward journey. */
        legs: Array<Record<string, unknown>>;

        /** CO2 emission details for the outward journey. */
        co2EmissionDetails: Record<string, unknown>;

        /** Sorting priority for the outward journey. */
        sortingPriority: number;

        /** Fare composition for the outward journey. */
        fareComposition: string;

        /** User-facing status for the outward journey. */
        userFacingStatus: string;
    };

    /** Rate information for the rail booking. */
    rate: {
        /** Base rate for the rail booking. */
        base: {
            /** Additional coinage details for the base rate. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Extra charges for the rail booking. */
        extras: Array<Record<string, unknown>>;

        /** Refund details for the rail booking. */
        refund: {
            /** Additional coinage details for the refund. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Tax details for the rail booking. */
        tax: {
            /** Additional coinage details for the tax. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Commission details for the rail booking. */
        commission: Record<string, unknown>;

        /** Indicates if the rate includes commission. */
        includesCommission: boolean;

        /** Breakdown of taxes for the rail booking. */
        taxBreakdown: {
            /** Tax details for the rail booking. */
            tax: Array<Record<string, unknown>>;
        };

        /** Transaction date for the rail booking. */
        transactionDate: Record<string, unknown>;

        /** Refund information for the rail booking. */
        refundInfo: Record<string, unknown>;
    };

    /** Rate metadata for the rail booking. */
    rateMetadata: {
        /** Type of negotiated rate for the rail booking. */
        negotiatedRateType: string;

        /** Published rate details for the rail booking. */
        publishedRate: Record<string, unknown>;

        /** TMC negotiated rate details for the rail booking. */
        tmcNegotiatedRate: Record<string, unknown>;

        /** Corporate negotiated rate details for the rail booking. */
        corporateNegotiatedRate: Record<string, unknown>;
    };

    /** Passenger information for the rail booking. */
    passengerInfos: Array<{
        /** Type of the passenger (e.g., ADULT, CHILD). */
        passengerType: string;

        /** Organization and user ID associated with the passenger. */
        userOrgId: {
            /** Organization ID details. */
            organizationId: {
                /** ID of the organization. */
                id: string;
            };

            /** User ID details. */
            userId: {
                /** ID of the user. */
                id: string;
            };
        };
    }>;

    /** Payment mode for the rail booking. */
    paymentMode: string;

    /** Sections associated with the rail booking. */
    sections: Array<{
        /** Fare details for the rail section. */
        fares: Array<Record<string, unknown>>;

        /** Vendor confirmations for the rail section. */
        vendorConfirmations: Array<Record<string, unknown>>;
    }>;

    /** Tickets associated with the rail booking. */
    tickets: Array<{
        /** Legs associated with the ticket. */
        legs: number[];

        /** Passenger references for the ticket. */
        passengerRefs: number[];
    }>;

    /** Ticket details for the rail booking. */
    ticketDetails: Array<Record<string, unknown>>;

    /** Type of rail booking (e.g., RETURN, ONE-WAY). */
    type: string;

    /** Vendor confirmation number for the rail booking. */
    vendorConfirmationNumber: string;

    /** Itinerary ID for the rail booking. */
    itineraryId: string;

    /** Ancillary services for the rail booking. */
    ancillaries: Array<Record<string, unknown>>;

    /** Terms and conditions for the rail booking. */
    termsAndConditions: {
        /** Conditions associated with the rail booking. */
        conditions: Array<Record<string, unknown>>;
    };

    /** Exchange information for the rail booking. */
    exchangeInfo: {
        /** Type of exchange for the rail booking. */
        exchangeType: string;

        /** Related section information for the rail booking. */
        relatedSectionInfo: {
            /** Indexes of new sections after exchange. */
            newSectionIndexes: Array<Record<string, unknown>>;

            /** Indexes of old sections before exchange. */
            oldSectionIndexes: Array<Record<string, unknown>>;
        };
    };

    /** Previous itinerary information for the rail booking. */
    previousItinerary: {
        /** Type of the previous itinerary. */
        type: string;

        /** Details of the outward journey in the previous itinerary. */
        outwardJourney: {
            /** Legs associated with the outward journey. */
            legs: Array<Record<string, unknown>>;
        };

        /** Details of the inward journey in the previous itinerary. */
        inwardJourney: {
            /** Legs associated with the inward journey. */
            legs: Array<Record<string, unknown>>;
        };

        /** Leg information for the previous itinerary. */
        legInfos: Array<Record<string, unknown>>;

        /** Sections associated with the previous itinerary. */
        sections: Array<Record<string, unknown>>;

        /** Delivery option for the previous itinerary. */
        deliveryOption: string;

        /** Source reference for the previous itinerary. */
        sourceReference: string;

        /** Rate information for the previous itinerary. */
        rate: {
            /** Extra charges for the previous itinerary. */
            extras: Array<Record<string, unknown>>;

            /** Commission details for the previous itinerary. */
            commission: Record<string, unknown>;

            /** Tax breakdown for the previous itinerary. */
            taxBreakdown: Record<string, unknown>;

            /** Refund information for the previous itinerary. */
            refundInfo: Record<string, unknown>;
        };
    };
};

/** Represents the structure of LimoPnr. */
type LimoPnr = {
    /** Cancellation policy for the limo booking. */
    cancellationPolicy: {
        /** Policy details for the limo booking. */
        policy: string;

        /** Deadline for the limo booking. */
        deadline: Record<string, unknown>;

        /** Deadline in UTC for the limo booking. */
        deadlineUtc: Record<string, unknown>;

        /** Duration before arrival deadline for the limo booking. */
        durationBeforeArrivalDeadline: Record<string, unknown>;

        /** Amount details for the limo booking. */
        amount: {
            /** Additional coinage details for the amount. */
            otherCoinage: Array<Record<string, unknown>>;
        };
    };

    /** Driver information for the limo booking. */
    driver: {
        /** Name of the limo driver. */
        name: string;

        /** Contact details of the limo driver. */
        phone: Record<string, unknown>;

        /** Instructions for the limo driver. */
        driverInstructions: string;
    };

    /** Legs associated with the limo booking. */
    legs: Array<Record<string, unknown>>;

    /** Limo details for the limo booking. */
    limoDetails: {
        /** Type of car for the limo booking. */
        carType: string;

        /** Indicates if the vehicle is electric. */
        electricVehicle: string;

        /** Name of the limo vendor. */
        vendorName: string;

        /** Additional vendor information for the limo booking. */
        limoVendorInfo: Record<string, unknown>;

        /** Amenities provided in the limo. */
        amenities: Record<string, unknown>;
    };

    /** Notes associated with the limo booking. */
    bookingNotes: string;

    /** Duration of the limo booking in ISO 8601 format. */
    duration: {
        /** ISO 8601 format. */
        iso8601: string;
    };

    /** Notes to the vendor for the limo booking. */
    notesToVendor: string;

    /** Type of payment for the limo booking. */
    paymentType: string;

    /** Status of the limo PNR. */
    pnrStatus: string;

    /** Rate information for the limo booking. */
    rate: {
        /** Base rate for the limo booking. */
        base: {
            /** Additional coinage details for the base rate. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Extra charges for the limo booking. */
        extras: Array<Record<string, unknown>>;

        /** Refund details for the limo booking. */
        refund: {
            /** Additional coinage details for the refund. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Tax details for the limo booking. */
        tax: {
            /** Additional coinage details for the tax. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Commission details for the limo booking. */
        commission: Record<string, unknown>;

        /** Indicates if the rate includes commission. */
        includesCommission: boolean;

        /** Breakdown of taxes for the limo booking. */
        taxBreakdown: {
            /** Tax details for the limo booking. */
            tax: Array<Record<string, unknown>>;
        };

        /** Transaction date for the limo booking. */
        transactionDate: Record<string, unknown>;

        /** Refund information for the limo booking. */
        refundInfo: Record<string, unknown>;
    };

    /** Vendor confirmation number for the limo booking. */
    vendorConfirmationNumber: string;

    /** Source status of the limo booking. */
    sourceStatus: string;
};

/** Represents the structure of MiscPnr. */
type MiscPnr = {
    /** Description of the miscellaneous booking. */
    description: string;

    /** End date and time of the miscellaneous booking in ISO 8601 format. */
    endDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };

    /** Status of the miscellaneous PNR. */
    pnrStatus: string;

    /** Rate information for the miscellaneous booking. */
    rate: {
        /** Base rate for the miscellaneous booking. */
        base: {
            /** Additional coinage details for the base rate. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Extra charges for the miscellaneous booking. */
        extras: Array<Record<string, unknown>>;

        /** Refund details for the miscellaneous booking. */
        refund: {
            /** Additional coinage details for the refund. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Tax details for the miscellaneous booking. */
        tax: {
            /** Additional coinage details for the tax. */
            otherCoinage: Array<Record<string, unknown>>;
        };

        /** Commission details for the miscellaneous booking. */
        commission: Record<string, unknown>;

        /** Indicates if the rate includes commission. */
        includesCommission: boolean;

        /** Breakdown of taxes for the miscellaneous booking. */
        taxBreakdown: {
            /** Tax details for the miscellaneous booking. */
            tax: Array<Record<string, unknown>>;
        };

        /** Transaction date for the miscellaneous booking. */
        transactionDate: Record<string, unknown>;

        /** Refund information for the miscellaneous booking. */
        refundInfo: Record<string, unknown>;
    };

    /** Start date and time of the miscellaneous booking in ISO 8601 format. */
    startDateTime: {
        /** ISO 8601 format. */
        iso8601: string;
    };

    /** Vendor confirmation number for the miscellaneous booking. */
    vendorConfirmationNumber: string;

    /** Sorting priority for the miscellaneous booking. */
    sortingPriority: number;

    /** Source status of the miscellaneous booking. */
    sourceStatus: string;
};

export type {TripData, Pnr, PnrTraveler, PnrData, AirPnr, HotelPnr, CarPnr, RailPnr, LimoPnr, MiscPnr};
