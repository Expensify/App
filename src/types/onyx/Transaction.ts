import {ValueOf} from 'type-fest';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';
import RecentWaypoint from './RecentWaypoint';

type Waypoint = {
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
    waypoints?: WaypointCollection;
    isLoading?: boolean;
    type?: string;
    customUnit?: Record<string, unknown>;
    source?: string;
    originalTransactionID?: string;
};

type GeometryType = 'LineString';

type Geometry = {
    coordinates: number[][] | null;
    type?: GeometryType;
};

type Receipt = {
    receiptID?: number;
    source?: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
};

type Route = {
    distance: number | null;
    geometry: Geometry;
};

type Routes = Record<string, Route>;

type Transaction = {
    amount: number;
    billable: boolean;
    category: string;
    comment: Comment;
    created: string;
    currency: string;
    errors?: OnyxCommon.Errors;
    errorFields?: OnyxCommon.ErrorFields;
    // The name of the file used for a receipt (formerly receiptFilename)
    filename?: string;
    merchant: string;
    modifiedAmount?: number;
    modifiedCreated?: string;
    modifiedCurrency?: string;
    modifiedMerchant?: string;
    modifiedWaypoints?: WaypointCollection;
    pendingAction: OnyxCommon.PendingAction;
    receipt: Receipt;
    reportID: string;
    routes?: Routes;
    transactionID: string;
    tag: string;
    pendingFields?: Partial<{[K in keyof Transaction]: ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>}>;

    /** Card Transactions */

    parentTransactionID?: string;
    reimbursable?: boolean;
    /** The CC for this transaction */
    cardID?: number;
    /** If the transaction is pending or posted */
    status?: ValueOf<typeof CONST.TRANSACTION.STATUS>;
    /** If an EReceipt should be generated for this transaction */
    hasEReceipt?: boolean;
    /** The MCC Group for this transaction */
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
    modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
    /** If the transaction was made in a foreign currency, we send the original amount and currency */
    originalAmount?: number;
    originalCurrency?: string;
};

export default Transaction;
export type {WaypointCollection, Comment, Receipt, Waypoint};
