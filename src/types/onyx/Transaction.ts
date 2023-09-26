import {ValueOf} from 'type-fest';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';
import RecentWaypoint from './RecentWaypoint';

type WaypointCollection = Record<string, RecentWaypoint | null>;
type Comment = {
    comment?: string;
    waypoints?: WaypointCollection;
};

type GeometryType = 'LineString';

type Geometry = {
    coordinates: number[][] | null;
    type?: GeometryType;
};

type Route = {
    distance: number | null;
    geometry: Geometry;
};

type Routes = Record<string, Route>;

type Transaction = {
    amount: number;
    category: string;
    comment: Comment;
    created: string;
    currency: string;
    errors: OnyxCommon.Errors;
    errorFields?: OnyxCommon.ErrorFields;
    // The name of the file used for a receipt (formerly receiptFilename)
    filename?: string;
    merchant: string;
    modifiedAmount?: number;
    modifiedCreated?: string;
    modifiedCurrency?: string;
    pendingAction: OnyxCommon.PendingAction;
    receipt: {
        receiptID?: number;
        source?: string;
        state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    };
    reportID: string;
    routes?: Routes;
    transactionID: string;
    tag: string;

    /** Card Transactions */

    reimbursable?: boolean;
    /** The CC for this transaction */
    cardID?: string;
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
export type {WaypointCollection};
