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
    amount: number;
    category: string;
    comment: Comment;
    created: string;
    currency: string;
    errors: OnyxCommon.Errors;
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
};

export default Transaction;
