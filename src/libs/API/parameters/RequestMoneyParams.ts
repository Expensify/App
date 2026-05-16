import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';

type RequestMoneyParams = {
    debtorEmail: string;
    debtorAccountID: number;
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    iouReportID: string;
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID: string;
    receipt?: Receipt;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    category?: string;
    tag?: string;
    taxCode: string;
    taxAmount: number;
    billable?: boolean;
    receiptGpsPoints?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread: string | undefined;
    reimbursable?: boolean;
    description?: string;
    attendees?: string;
    isTestDrive?: boolean;
    guidedSetupData?: string;
    testDriveCommentReportActionID?: string;

    /** Transaction type (e.g., 'time' for time tracking expenses) */
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;

    /** Number of hours for time tracking expenses */
    count?: number;

    /** Hourly rate in cents. Use convertToBackendAmount() to convert from policy rate (which is stored as a float) */
    rate?: number;

    /** Unit for time tracking (e.g., 'h' for hours) */
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;

    /** Distance in miles/kilometers for distance-based expenses */
    distance?: number;

    /** Waypoints for distance-based expenses (JSON stringified) */
    waypoints?: string;

    /** Custom unit rate ID for distance-based expenses */
    customUnitRateID?: string;

    /** Odometer start reading for distance-based expenses */
    odometerStart?: number;

    /** Odometer end reading for distance-based expenses */
    odometerEnd?: number;

    /** Whether this is a distance request */
    isDistance?: boolean;

    /** When true, the backend defers auto-submit so batch expense creation (e.g. duplicate report) can finish before the report is submitted */
    shouldDeferAutoSubmit?: boolean;
};

export default RequestMoneyParams;
