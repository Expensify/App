import type {Errors} from './OnyxCommon';

/** An airport or city code the traveler searches from or to */
type FlightSearchLocation = {
    /** IATA airport code, or IATA city code when isCity is true */
    code: string;

    /** Whether the code is a city, which searches all of its airports */
    isCity?: boolean;
};

/** One leg of a flight search */
type FlightSearchLeg = {
    origin: FlightSearchLocation;
    destination: FlightSearchLocation;

    /** Departure date, YYYY-MM-DD */
    date: string;
};

/** Filters Spotnana applies to a flight search */
type FlightSearchFilters = {
    /** Maximum number of stops, 0 for nonstop */
    maxStops?: number;

    /** Cabin to search, such as ECONOMY or BUSINESS */
    cabin?: string;

    /** IATA airline codes to include */
    airlines?: string[];

    /** Alliances to include, such as STAR_ALLIANCE */
    alliances?: string[];
};

/** An airport in a flight segment */
type FlightAirport = {
    /** IATA airport code */
    code: string;
    name: string;
    cityName: string;

    /** IANA timezone of the airport, for showing local times and computing durations */
    timezone: string;
};

/** One flight segment */
type FlightSegment = {
    /** Marketing airline code */
    airline: string;

    /** Marketing airline code and flight number, such as DL405 */
    flightNumber: string;

    /** Airline that operates the flight, when it differs from the marketing airline */
    operatingAirline: string;
    origin: FlightAirport;
    destination: FlightAirport;

    /** Local departure time, ISO 8601 without a timezone */
    departureTime: string;

    /** Local arrival time, ISO 8601 without a timezone */
    arrivalTime: string;

    /** Flight duration, ISO 8601 duration such as PT5H31M */
    duration: string;
    aircraft: string;
};

/** The rules shown on a fare card */
type FlightFareRuleSummary = {
    /** Change rule, such as "Change allowed for 99 USD" */
    change: string;

    /** Refund rule, such as "Non-refundable" */
    refund: string;
    seatSelection: string;
    carryOn: string[];
    checkedBags: string[];
};

/** A travel policy rule the fare breaks */
type FlightPolicyViolation = {
    /** Spotnana's rule name, such as HIGHEST_ALLOWED_CABIN_VIOLATION */
    rule: string;
    description: string;

    /** The policy limit, as Spotnana returns it */
    expectedValue: Record<string, unknown>;

    /** The fare's value for the rule, as Spotnana returns it */
    actualValue: Record<string, unknown>;
};

/** One fare family sold for a flight row */
type FlightFare = {
    /** Spotnana's ID for the fare, passed to the next leg's search, fare rules and checkout */
    fareID: string;

    /** Fare family name, such as Main Basic */
    fareName: string;

    /** Cabin view category: BASIC, ECONOMY, PREMIUM_ECONOMY, BUSINESS or FIRST */
    cabin: string;

    /** Total price in cents */
    total: number;
    currency: string;
    rules: FlightFareRuleSummary;

    /** Travel policy rules the fare breaks, empty when in policy */
    policyViolations: FlightPolicyViolation[];

    /** Whether the itinerary is made of independent tickets */
    isSeparateTicket: boolean;
};

/** One flight row in search results */
type FlightItinerary = {
    /** Key of the row within this search */
    itineraryID: string;

    /** Flight segments in order */
    flights: FlightSegment[];
    fares: FlightFare[];
};

/** Values present in the results, for the filter menus */
type FlightSearchFilterOptions = {
    airlines: Array<{
        code: string;
        name: string;
    }>;
    alliances: string[];

    /** Airports where results connect */
    connectingAirports: string[];
};

/** The traveler's current flight search and its results, replaced by each new search */
type TravelFlightSearch = {
    /** The search the traveler entered */
    query?: {
        policyID: string;
        legs: FlightSearchLeg[];
        filters: FlightSearchFilters;
    };

    /** Spotnana's search ID, needed to fetch the next leg and to start checkout */
    searchID?: string;

    /** Which leg the results are for, 0 for the first leg */
    legIndex?: number;

    /** One entry per flight row */
    itineraries?: FlightItinerary[];

    /** Values present in the results, for the filter menus */
    filterOptions?: FlightSearchFilterOptions;
    isLoading?: boolean;
    errors?: Errors | null;
};

/** An airport returned for the From and To fields */
type TravelAirport = {
    /** IATA airport code */
    code: string;
    name: string;

    /** IATA city code, shared by the airports of one city */
    cityCode: string;
    cityName: string;

    /** State or region name */
    stateName: string;

    /** ISO country code */
    countryCode: string;
    countryName: string;
};

/** Full fare rule text for one leg of a fare */
type FlightFareRules = {
    /** Leg origin airport code */
    origin: string;

    /** Leg destination airport code */
    destination: string;
    rules: Array<{
        /** Fare basis code the rule belongs to */
        fareBasisCode: string;

        /** Section title, such as PENALTIES */
        title: string;
        text: string;
    }>;
};

export default TravelFlightSearch;
export type {
    FlightSearchLocation,
    FlightSearchLeg,
    FlightSearchFilters,
    FlightAirport,
    FlightSegment,
    FlightFareRuleSummary,
    FlightPolicyViolation,
    FlightFare,
    FlightItinerary,
    FlightSearchFilterOptions,
    TravelAirport,
    FlightFareRules,
};
