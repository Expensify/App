import type {KeysOfUnion, ValueOf} from 'type-fest';
import type {IOURequestType} from '@libs/actions/IOU';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type {Participant, Split} from './IOU';
import type * as OnyxCommon from './OnyxCommon';
import type RecentWaypoint from './RecentWaypoint';
import type ReportAction from './ReportAction';

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

type WaypointCollection = Record<string, RecentWaypoint | Waypoint>;

type Comment = {
    comment?: string;
    hold?: string;
    waypoints?: WaypointCollection;
    isLoading?: boolean;
    type?: string;
    customUnit?: TransactionCustomUnit;
    source?: string;
    originalTransactionID?: string;
    splits?: Split[];
};

type TransactionCustomUnit = {
    customUnitID?: string;
    customUnitRateID?: string;
    quantity?: number;
    name?: string;
    defaultP2PRate?: number;
};

type GeometryType = 'LineString';

type Geometry = {
    coordinates: number[][] | null;
    type?: GeometryType;
};

type ReceiptSource = string;

type Receipt = {
    receiptID?: number;
    path?: string;
    name?: string;
    source?: ReceiptSource;
    filename?: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    type?: string;
};

type Route = {
    distance: number | null;
    geometry: Geometry;
};

type Routes = Record<string, Route>;

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

type SplitShare = {
    amount: number;
    isModified?: boolean;
};

type SplitShares = Record<number, SplitShare | null>;

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
        comment: Comment;

        /** Date that the expense was created */
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
        iouRequestType?: IOURequestType;

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

        /** The actionable report action ID associated with the transaction */
        actionableWhisperReportActionID?: string;

        /** The linked reportAction id for the tracked expense */
        linkedTrackedExpenseReportAction?: ReportAction;

        /** The linked report id for the tracked expense */
        linkedTrackedExpenseReportID?: string;
    },
    keyof Comment
>;

type TransactionPendingFieldsKey = KeysOfUnion<Transaction['pendingFields']>;

type AdditionalTransactionChanges = {
    comment?: string;
    waypoints?: WaypointCollection;
    oldAmount?: number;
    oldCurrency?: string;
};

type TransactionChanges = Partial<Transaction> & AdditionalTransactionChanges;

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
    ReceiptSource,
    TransactionCollectionDataSet,
    SplitShare,
    SplitShares,
};
