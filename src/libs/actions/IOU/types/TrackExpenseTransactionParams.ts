import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Receipt, WaypointCollection} from '@src/types/onyx/Transaction';

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
    receipt?: Receipt;
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
};

export type {TrackExpenseTransactionParams, GPSPoint};
