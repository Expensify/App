import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Participant, Split} from './IOU';
import type * as OnyxCommon from './OnyxCommon';
import type RecentWaypoint from './RecentWaypoint';

type Waypoint = {
    /** The name associated with the address of the waypoint */
    name?: string;

    /** The full address of the waypoint */
    address?: string;

    /** The lattitude of the waypoint */
    lat?: number;

    /** The longitude of the waypoint */
    lng?: number;
};

type WaypointCollection = Record<string, RecentWaypoint | Waypoint>;

type Comment = {
    comment?: string;
    hold?: string;
    waypoints?: WaypointCollection;
    isLoading?: boolean;
    type?: string;
    customUnit?: Record<string, unknown>;
    source?: string;
    originalTransactionID?: string;
    splits?: Split[];
};

type GeometryType = 'LineString';

type Geometry = {
    coordinates: number[][] | null;
    type?: GeometryType;
};

type ReceiptSource = string | number;

type Receipt = {
    receiptID?: number;
    path?: string;
    name?: string;
    source?: ReceiptSource;
    filename?: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
};

type Route = {
    distance: number | null;
    geometry: Geometry;
};

type Routes = Record<string, Route>;

type TransactionPendingFieldsKey = keyof Transaction | keyof Comment;

type ReceiptError = {error?: string; source: string; filename: string};

type ReceiptErrors = Record<string, ReceiptError>;

type TaxRateData = {
    name: string;
    value: string;
    code?: string;
};

type TaxRate = {
    text: string;
    keyForList: string;
    searchText: string;
    tooltipText: string;
    isDisabled?: boolean;
    data?: TaxRateData;
};

type Transaction = {
    /** The original transaction amount */
    amount: number;

    /** Whether the request is billable */
    billable?: boolean;

    /** The category name */
    category?: string;

    /** The comment object on the transaction */
    comment: Comment;

    /** Date that the request was created */
    created: string;

    /** The original currency of the transaction */
    currency: string;

    /** Any additional error message to show */
    errors?: OnyxCommon.Errors | ReceiptErrors;

    /** Server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields<'route'>;

    /** The name of the file used for a receipt (formerly receiptFilename) */
    filename?: string;

    /** Used during the creation flow before the transaction is saved to the server */
    iouRequestType?: ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

    /** The original merchant name */
    merchant: string;

    /** The edited transaction amount */
    modifiedAmount?: number;

    /** The edited transaction date */
    modifiedCreated?: string;

    /** The edited currency of the transaction */
    modifiedCurrency?: string;

    /** The edited merchant name */
    modifiedMerchant?: string;

    /** The edited waypoints for the distance request */
    modifiedWaypoints?: WaypointCollection;

    /**
     * Used during the creation flow before the transaction is saved to the server and helps dictate where
     * the user is navigated to when pressing the back button on the confirmation step
     */
    participantsAutoAssigned?: boolean;

    /** Selected participants */
    participants?: Participant[];

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** The receipt object associated with the transaction */
    receipt?: Receipt;

    /** The iouReportID associated with the transaction */
    reportID: string;

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

    /** Tax amount */
    taxAmount?: number;

    /** Pending fields for the transaction */
    pendingFields?: Partial<{[K in keyof Transaction | keyof Comment]: ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>}>;

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
};

type AdditionalTransactionChanges = {
    comment?: string;
    waypoints?: WaypointCollection;
    oldAmount?: number;
    oldCurrency?: string;
};

type TransactionChanges = Partial<Transaction> & AdditionalTransactionChanges;

export default Transaction;
export type {WaypointCollection, Comment, Receipt, Waypoint, ReceiptError, ReceiptErrors, TransactionPendingFieldsKey, TransactionChanges, TaxRate, ReceiptSource};
