import {ValueOf} from 'type-fest';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';
import RecentWaypoints from './RecentWaypoints';

type Comment = {
    comment?: string;
    waypoints?: Record<string, RecentWaypoints>;
};

type GeometryType = 'LineString' | '';

type Geometry = {
    coordinates: number[][] | null;
    type: GeometryType;
};

type Route = {
    distance: number | null;
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
    errorFields?: OnyxCommon.ErrorFields;
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
