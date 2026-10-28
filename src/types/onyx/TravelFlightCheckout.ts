import type {Errors} from './OnyxCommon';
import type {FlightFareRuleSummary, FlightPolicyViolation, FlightSegment} from './TravelFlightSearch';

/** A flight segment at checkout */
type FlightCheckoutSegment = FlightSegment & {
    /** Spotnana's ID for the flight, used to pick its seat */
    flightID: string;
    cabin: string;
};

/** One leg of the itinerary at checkout */
type FlightCheckoutLeg = {
    /** Flight segments in order */
    flights: FlightCheckoutSegment[];

    /** Fare family name, such as Main Basic */
    fareName: string;

    /** Cabin view category: BASIC, ECONOMY, PREMIUM_ECONOMY, BUSINESS or FIRST */
    cabin: string;
    rules: FlightFareRuleSummary;
};

/** Price of the itinerary, in cents */
type FlightPriceSummary = {
    /** Base fare */
    flight: number;

    /** Taxes and airline fees */
    taxes: number;

    /** Flight plus taxes */
    total: number;

    /** Currency of every amount */
    currency: string;
};

/** A column of a seat map */
type FlightSeatMapColumn = {
    column: string;

    /** WINDOW, CENTER or AISLE */
    position: string;
};

/** A seat in a seat map row */
type FlightSeat = {
    column: string;
    isAvailable: boolean;

    /** Spotnana's seat type, such as SEAT */
    type: string;

    /** Seat price in cents, 0 when free */
    price: number;
    currency: string;
};

/** One cabin of a seat map, which has its own seat layout */
type FlightSeatMapCabin = {
    /** Cabin, such as BUSINESS or ECONOMY */
    cabin: string;

    /** Column blocks between aisles, left to right */
    columns: FlightSeatMapColumn[][];

    /** Rows front to back */
    rows: Array<{
        row: number;
        seats: FlightSeat[];
    }>;
};

/** The seat map of one flight */
type FlightSeatMap = {
    /** Spotnana's seat map ID */
    seatMapID?: string;

    /** Cabins front to back */
    cabins?: FlightSeatMapCabin[];
};

/** A card the traveler can pay for flights with */
type FlightPaymentSource = {
    /** Spotnana's ID for the card */
    paymentSourceID: string;
    name: string;

    /** Card network, such as VISA */
    network: string;
    lastFour: string;
    expiryMonth: number;
    expiryYear: number;
};

/** The flights the traveler is checking out, replaced each time checkout starts */
type TravelFlightCheckout = {
    policyID?: string;

    /** Spotnana search ID of the last leg */
    searchID?: string;

    /** Fare picked on the last leg */
    fareID?: string;

    /** Spotnana checkout workflow ID, needed to book */
    checkoutResponseID?: string;

    /** Spotnana seat map workflow ID, needed to book */
    seatMapResponseID?: string;

    /** Legs, flights and fares shown in Flight details */
    itinerary?: {
        legs: FlightCheckoutLeg[];

        /** Travel policy rules the itinerary breaks, empty when in policy */
        policyViolations: FlightPolicyViolation[];

        /** Whether the itinerary is made of independent tickets */
        isSeparateTicket: boolean;
    };
    priceSummary?: FlightPriceSummary;

    /** Traveler fields the airline requires, such as DATE_OF_BIRTH */
    requiredTravelerFields?: string[];

    /** One seat map per flight, in flight order */
    seatMaps?: FlightSeatMap[];

    /** Seats the traveler picked, keyed by flightID */
    selectedSeats?: Record<string, string>;

    /** The traveler's cards that can pay for flights */
    paymentSources?: FlightPaymentSource[];
    isLoading?: boolean;
    errors?: Errors | null;
};

export default TravelFlightCheckout;
export type {FlightCheckoutSegment, FlightCheckoutLeg, FlightPriceSummary, FlightSeatMapColumn, FlightSeat, FlightSeatMapCabin, FlightSeatMap, FlightPaymentSource};
