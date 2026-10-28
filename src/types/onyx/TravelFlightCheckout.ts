import type {Errors} from './OnyxCommon';
import type {FlightFare, FlightSegment} from './TravelFlightSearch';

/** A flight segment at checkout */
type FlightCheckoutSegment = FlightSegment & {
    /** Spotnana's ID for the flight, used to pick its seat */
    flightID: string;

    /** Cabin booked on the flight */
    cabin: string;
};

/** One leg of the itinerary at checkout */
type FlightCheckoutLeg = {
    /** Flight segments in order */
    flights: FlightCheckoutSegment[];

    /** Fare booked for the leg */
    fare: FlightFare;
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
    /** Column letter */
    column: string;

    /** WINDOW, CENTER or AISLE */
    position: string;
};

/** A seat in a seat map row */
type FlightSeat = {
    /** Column letter */
    column: string;

    /** Whether the seat can be picked */
    isAvailable: boolean;

    /** Spotnana's seat type, such as SEAT */
    type: string;

    /** Seat price in cents, 0 when free */
    price: number;

    /** Currency of the price */
    currency: string;
};

/** The seat map of one flight */
type FlightSeatMap = {
    /** Spotnana's seat map ID */
    seatMapID?: string;

    /** Cabin the seat map covers */
    cabin?: string;

    /** Column blocks between aisles, left to right */
    columns?: FlightSeatMapColumn[][];

    /** Rows front to back */
    rows?: Array<{
        /** Row number */
        row: number;

        /** Seats in the row */
        seats: FlightSeat[];
    }>;
};

/** A card the traveler can pay for flights with */
type FlightPaymentSource = {
    /** Spotnana's ID for the card */
    paymentSourceID: string;

    /** Card label */
    name: string;

    /** Card network, such as VISA */
    network: string;

    /** Last four digits */
    lastFour: string;

    /** Expiry month */
    expiryMonth: number;

    /** Expiry year */
    expiryYear: number;
};

/** The flights the traveler is checking out, replaced each time checkout starts */
type TravelFlightCheckout = {
    /** Policy the traveler is booking on */
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
        /** Legs in order */
        legs: FlightCheckoutLeg[];

        /** Whether the itinerary is made of independent tickets */
        isSeparateTicket: boolean;
    };

    /** Price of the itinerary */
    priceSummary?: FlightPriceSummary;

    /** Traveler fields the airline requires, such as DATE_OF_BIRTH */
    requiredTravelerFields?: string[];

    /** One seat map per flight, in flight order */
    seatMaps?: FlightSeatMap[];

    /** Seats the traveler picked, keyed by flightID */
    selectedSeats?: Record<string, string>;

    /** The traveler's cards that can pay for flights */
    paymentSources?: FlightPaymentSource[];

    /** Whether checkout is loading */
    isLoading?: boolean;

    /** Errors from starting checkout */
    errors?: Errors | null;
};

export default TravelFlightCheckout;
export type {FlightCheckoutSegment, FlightCheckoutLeg, FlightPriceSummary, FlightSeatMapColumn, FlightSeat, FlightSeatMap, FlightPaymentSource};
