import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Receipt, WaypointCollection} from '@src/types/onyx/Transaction';

import type {ValueOf} from 'type-fest';

type GPSPoint = {
    lat: number;
    long: number;
};

type TrackExpenseTransactionParams = {
    amount: number;
    currency: string;
    created: string | undefined;
    merchant?: string;
    comment?: string;
    distance?: number;
    modifiedDistance?: number;
    receipt?: Receipt;
    /**
     * Overrides the state carried on `receipt` when the caller derives it at submit time. The Scan confirmation does,
     * because a receipt validated before the user finished typing carries a state that is a field behind.
     */
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    taxValue?: string;
    billable?: boolean;
    reimbursable?: boolean;
    validWaypoints?: WaypointCollection;
    gpsPoint?: GPSPoint;
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    customUnitRateID?: string;
    attendees?: Attendee[];
    isLinkedTrackedExpenseReportArchived?: boolean;
    odometerStart?: number;
    odometerEnd?: number;
    isFromGlobalCreate?: boolean;
    gpsCoordinates?: string;
    distanceRequestType?: string;

    /** Distance in meters of the alternate map route the user picked, so the backend doesn't fall back to the primary route */
    selectedRouteDistance?: number;
};

export type {TrackExpenseTransactionParams, GPSPoint};
