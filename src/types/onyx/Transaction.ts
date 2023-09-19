import {ValueOf} from 'type-fest';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';

type Comment = {
    comment?: string;
};

type Geometry = {
    coordinates: number[][];
    type: 'LineString';
};

type Route = {
    distance: number;
    geometry: Geometry;
};

type Routes = Record<string, Route>;

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
    routes?: Routes;
};

export default Transaction;
