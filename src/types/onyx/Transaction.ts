import {ValueOf} from 'type-fest';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';
import RecentWaypoints from './RecentWaypoints';

type Comment = {
    comment?: string;
    waypoints?: Record<string, RecentWaypoints>;
};

type Transaction = {
    transactionID: string;
    amount: number;
    category?: string;
    currency: string;
    reportID: string;
    comment: Comment;
    merchant: string;
    created: string;
    pendingAction: OnyxCommon.PendingAction;
    errors: OnyxCommon.Errors;
    modifiedAmount?: number;
    modifiedCreated?: string;
    modifiedCurrency?: string;
    receipt: {
        receiptID?: number;
        source?: string;
        state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    };
    // TODO: fix unknown type
    routes: Record<string, unknown>;
    errorFields: OnyxCommon.ErrorFields;
};

export default Transaction;
