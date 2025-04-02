import type {KeysOfUnion, ValueOf} from 'type-fest';
import type {CreateTrackExpenseParams, IOURequestType, ReplaceReceipt, RequestMoneyInformation, StartSplitBilActionParams} from '@libs/actions/IOU';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type {Attendee, Participant, Split} from './IOU';
import type * as OnyxCommon from './OnyxCommon';
import type {Unit} from './Policy';
import type RecentWaypoint from './RecentWaypoint';
import type ReportAction from './ReportAction';
import type {ViolationName} from './TransactionViolation';

/** Model of waypoint */
type Waypoint = {
    /** The name associated with the address of the waypoint */
    name?: string;

    /** The full address of the waypoint */
    address?: string;

    /** The lattitude of the waypoint */
    lat?: number;

    /** The longitude of the waypoint */
    lng?: number;

    /** Address city */
    city?: string;

    /** Address state */
    state?: string;

    /** Address zip code */
    zipCode?: string;

    /** Address country */
    country?: string;

    /** Address street line 1 */
    street?: string;

    /** Address street line 2 */
    street2?: string;

    /** A unique key for waypoint is required for correct draggable list rendering */
    keyForList?: string;
};

/**
 * Collection of waypoints, indexed by `waypoint${index}`
 * where `index` corresponds to the position of the waypoint in the list
 */
type WaypointCollection = Record<string, RecentWaypoint | Waypoint>;

/** Model of transaction comment */
type Comment = {
    /** Selected attendees */
    attendees?: Attendee[];

    /** Content of the transaction comment */
    comment?: string;

    /** Whether the transaction is on hold */
    hold?: string;

    /** Collection of waypoints associated with the transaction */
    waypoints?: WaypointCollection;

    /** Whether the transaction comment is loading */
    isLoading?: boolean;

    /** Type of the transaction */
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;

    /** In custom unit transactions this holds the information of the custom unit */
    customUnit?: TransactionCustomUnit;

    /** Source of the transaction which when specified matches `split` */
    source?: string;

    /** ID of the original transaction */
    originalTransactionID?: string;

    /** In split transactions this is a collection of participant split data */
    splits?: Split[];

    /** Violations that were dismissed */
    dismissedViolations?: Partial<Record<ViolationName, Record<string, string | number>>>;

    /** Defines the type of liability for the transaction */
    liabilityType?: ValueOf<typeof CONST.TRANSACTION.LIABILITY_TYPE>;
};

/** Model of transaction custom unit */
type TransactionCustomUnit = {
    /** Attributes related to custom unit */
    attributes?: {
        /** Duration of the custom unit for per diem */
        dates: {
            /** Start date of the custom unit */
            start: string;

            /** End date of the custom unit */
            end: string;
        };
    };

    /** ID of the custom unit */
    customUnitID?: string;

    /** ID of the custom unit rate */
    customUnitRateID?: string;

    /** Custom unit amount */
    quantity?: number | null;

    /** Name of the custom unit */
    name?: ValueOf<typeof CONST.CUSTOM_UNITS>;

    /** Default rate for custom unit */
    defaultP2PRate?: number | null;

    /** The unit for the distance/quantity */
    distanceUnit?: Unit;

    /** Sub Rates for the custom unit */
    subRates?: Array<{
        /** Key of the sub rate */
        key?: string;

        /** ID of the custom unit sub rate */
        id: string;

        /** Custom unit amount */
        quantity: number;

        /** Custom unit name */
        name: string;

        /** Custom unit rate */
        rate: number;
    }>;
};

/** Types of geometry */
type GeometryType = 'LineString';

/** Geometry data */
type Geometry = {
    /** Matrix of points, indexed by their coordinates */
    coordinates: number[][] | null;

    /** Type of connections between coordinates */
    type?: GeometryType;
};

/** Accepted receipt paths */
type ReceiptSource = string;

/** Model of receipt */
type Receipt = {
    /** Name of receipt file */
    name?: string;

    /** ID of receipt file */
    receiptID?: number;

    /** Path of the receipt file */
    source?: ReceiptSource;

    /** Name of receipt file */
    filename?: string;

    /** Current receipt scan state */
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;

    /** Type of the receipt file */
    type?: string;

    /** Collection of reservations */
    reservationList?: Reservation[];
};

/** Model of route */
type Route = {
    /** Distance amount of the route */
    distance: number | null;

    /** Route geometry data */
    geometry: Geometry;
};

/** Collection of routes, indexed by `route${index}` where `index` is the position of the route in the list */
type Routes = Record<string, Route>;

/** Model of receipt error */
type ReceiptError = {
    /** Path of the receipt file */
    source: string;

    /** Name of the receipt file */
    filename: string;

    /** Action that caused the error */
    action: string;

    /** Parameters required to retry the failed action */
    retryParams: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
};

/** Collection of receipt errors, indexed by a UNIX timestamp of when the error occurred */
type ReceiptErrors = Record<string, ReceiptError>;

/** Tax rate data */
type TaxRateData = {
    /** Tax rate percentage */
    value: string;

    /** Tax rate code */
    code?: string;
};

/** Model of tax rate */
type TaxRate = {
    /** Default name of the tax rate */
    text: string;

    /** Key of the tax rate to index it on options list */
    keyForList: string;

    /** Data of the tax rate */
    data?: TaxRateData;
};

/** This represents the details of the traveler */
type TravelerPersonalDetails = {
    /** Email of the traveler */
    email: string;

    /** Name of the traveler */
    name: string;
};

/** Model of reservation */
type Reservation = {
    /** ID of the reservation */
    reservationID?: string;

    /** Details about the start of the reservation */
    start: ReservationTimeDetails;

    /** Details about the end of the reservation */
    end: ReservationTimeDetails;

    /** Type of reservation */
    type: ReservationType;

    /** In flight reservations, this represents the details of the airline company */
    company?: Company;

    /** In car and hotel reservations, this represents the cancellation policy */
    cancellationPolicy?: string;

    /** In car and hotel reservations, this represents the cancellation deadline */
    cancellationDeadline?: string;

    /** Collection of passenger confirmations */
    confirmations?: ReservationConfirmation[];

    /** In flight and car reservations, this represents the number of passengers */
    numPassengers?: number;

    /** In flight reservations, this represents the flight duration in seconds */
    duration: number;

    /** In hotel reservations, this represents the number of rooms reserved */
    numberOfRooms?: number;

    /** In hotel reservations, this represents the room class */
    roomClass?: string;

    /** In flight reservations, this represents the details of the route */
    route?: {
        /** Route airline code */
        airlineCode: string;

        /** Passenger class */
        class?: string;

        /** Passenger seat number */
        number: string;

        /** Rail route name */
        name?: string;
    };

    /** In car reservations, this represents the car dealership name */
    vendor?: string;

    /** In car reservations, this represents the details of the car */
    carInfo?: CarInfo;

    /** Payment type of the reservation */
    paymentType?: string;

    /** Arrival gate details */
    arrivalGate?: {
        /** Arrival terminal number */
        terminal: string;
    };

    /** Coach number for rail */
    coachNumber?: string;

    /** Seat number for rail */
    seatNumber?: string;

    /** This represents the details of the traveler */
    travelerPersonalInfo?: TravelerPersonalDetails;
};

/** Model of trip reservation time details */
type ReservationTimeDetails = {
    /** Date timestamp */
    date: string;

    /** In hotel reservations, this is the address of the hotel */
    address?: string;

    /** In car reservations, this is the location of the car dealership */
    location?: string;

    /** In flight reservations, this is the long name of the airport */
    longName?: string;

    /** In flight reservations, this is the short name of the airport */
    shortName?: string;

    /** Timezone offset */
    timezoneOffset?: string;

    /** City name */
    cityName?: string;
};

/** Model of airline company details */
type Company = {
    /** Long name of airline company */
    longName: string;

    /** Short name of airline company */
    shortName?: string;

    /** Phone number of airline company support */
    phone?: string;
};

/** Model of reservation confirmation */
type ReservationConfirmation = {
    /** Passenger name */
    name: string;

    /** Reservation code */
    value: string;
};

/** Model of car details */
type CarInfo = {
    /** Name of the car */
    name?: string;

    /** Engine type */
    engine?: string;
};

/** Types of reservations */
type ReservationType = ValueOf<typeof CONST.RESERVATION_TYPE>;

/** Participant split data */
type SplitShare = {
    /** Amount to be split with participant */
    amount: number;

    /** Whether the split was modified */
    isModified?: boolean;
};

/** Record of participant split data, indexed by their `accountID` */
type SplitShares = Record<number, SplitShare | null>;

/** Model of transaction */
type Transaction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** The original transaction amount */
        amount: number;

        /** The transaction tax amount */
        taxAmount?: number;

        /** The transaction tax code */
        taxCode?: string;

        /** Whether the expense is billable */
        billable?: boolean;

        /** The category name */
        category?: string;

        /** The comment object on the transaction */
        comment?: Comment;

        /** Date that the expense was created */
        created: string;

        /** The original currency of the transaction */
        currency: string;

        /** Any additional error message to show */
        errors?: OnyxCommon.Errors | ReceiptErrors;

        /** Server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** The name of the file used for a receipt (formerly receiptFilename) */
        filename?: string;

        /** Used during the creation flow before the transaction is saved to the server */
        iouRequestType?: IOURequestType;

        /** The original merchant name */
        merchant: string;

        /** The edited transaction amount */
        modifiedAmount?: number;

        /** The edited attendees list */
        modifiedAttendees?: Attendee[];

        /** The edited transaction date */
        modifiedCreated?: string;

        /** The edited currency of the transaction */
        modifiedCurrency?: string;

        /** The edited merchant name */
        modifiedMerchant?: string;

        /** The edited waypoints for the distance expense */
        modifiedWaypoints?: WaypointCollection;

        /**
         * Used during the creation flow before the transaction is saved to the server and helps dictate where
         * the user is navigated to when pressing the back button on the confirmation step
         */
        participantsAutoAssigned?: boolean;

        /** Selected participants */
        participants?: Participant[];

        /** The receipt object associated with the transaction */
        receipt?: Receipt;

        /** The iouReportID associated with the transaction */
        reportID: string | undefined;

        /** Existing routes */
        routes?: Routes;

        /** The transaction id */
        transactionID: string;

        /** The transaction tag */
        tag?: string;

        /** Whether the transaction was created globally */
        isFromGlobalCreate?: boolean;

        /** The transaction tax rate */
        taxRate?: TaxRate;

        /** Card Transactions */

        /** The parent transaction id */
        parentTransactionID?: string;

        /** Whether the expense is reimbursable or not */
        reimbursable?: boolean;

        /** The CC for this transaction */
        cardID?: number;

        /** If the transaction is pending or posted */
        status?: ValueOf<typeof CONST.TRANSACTION.STATUS>;

        /** If an EReceipt should be generated for this transaction */
        hasEReceipt?: boolean;

        /** The MCC Group for this transaction */
        mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

        /** Modified MCC Group */
        modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

        /** If the transaction was made in a foreign currency, we send the original amount and currency */
        originalAmount?: number;

        /** The original currency of the transaction */
        originalCurrency?: string;

        /** Indicates transaction loading */
        isLoading?: boolean;

        /** Holds individual shares of a split keyed by accountID, only used locally */
        splitShares?: SplitShares;

        /** Holds the accountIDs of accounts who paid the split, for now only supports a single payer */
        splitPayerAccountIDs?: number[];

        /** Whether the user input should be kept */
        shouldShowOriginalAmount?: boolean;

        /** The actionable report action ID associated with the transaction */
        actionableWhisperReportActionID?: string;

        /** The linked reportAction id for the tracked expense */
        linkedTrackedExpenseReportAction?: ReportAction;

        /** The linked report id for the tracked expense */
        linkedTrackedExpenseReportID?: string;

        /** The bank of the purchaser card, if any */
        bank?: string;

        /** The display name of the purchaser card, if any */
        cardName?: string;

        /** The masked PAN of the purchaser card, if any */
        cardNumber?: string;

        /** Whether the transaction is linked to a managed card */
        managedCard?: boolean;

        /** The card transaction's posted date */
        posted?: string;

        /** The inserted time of the transaction */
        inserted?: string;
    },
    keyof Comment | keyof TransactionCustomUnit | 'attendees'
>;

/** Keys of pending transaction fields */
type TransactionPendingFieldsKey = KeysOfUnion<Transaction['pendingFields']>;

/** Additional transaction changes data */
type AdditionalTransactionChanges = {
    /** Content of modified comment */
    comment?: string;

    /** Collection of modified waypoints */
    waypoints?: WaypointCollection;

    /** Collection of modified attendees */
    attendees?: Attendee[];

    /** The ID of the distance rate */
    customUnitRateID?: string;

    /** Previous amount before changes */
    oldAmount?: number;

    /** Previous currency before changes */
    oldCurrency?: string;
};

/** Model of transaction changes  */
type TransactionChanges = Partial<Transaction> & AdditionalTransactionChanges;

/** Collection of mock transactions, indexed by `transactions_${transactionID}` */
type TransactionCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.TRANSACTION>;

export default Transaction;
export type {
    WaypointCollection,
    Comment,
    Receipt,
    Waypoint,
    Routes,
    ReceiptError,
    ReceiptErrors,
    TransactionPendingFieldsKey,
    TransactionChanges,
    TaxRate,
    Reservation,
    ReservationTimeDetails,
    ReservationType,
    ReceiptSource,
    TransactionCollectionDataSet,
    SplitShare,
    SplitShares,
    TransactionCustomUnit,
};
