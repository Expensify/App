import type {Unit} from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';

type CreateDistanceRequestParams = {
    transactionID: string;
    chatReportID: string;
    createdChatReportActionID?: string;
    reportActionID: string;
    waypoints: string;
    customUnitRateID: string;
    comment: string;
    created: string;
    iouReportID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID?: string;
    amount?: number;
    category?: string;
    receipt?: Receipt;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
    payerEmail?: string;
    payerAccountID?: number;
    splits?: string;
    chatType?: string;
    description?: string;
    attendees?: string;
    distance?: number;
    modifiedDistance?: number;
    odometerStart?: number;
    odometerEnd?: number;

    /** Distance unit the odometer readings were entered in, so the backend can convert them when the rate uses a different unit */
    odometerUnit?: Unit;
    gpsCoordinates?: string;
    distanceRequestType?: string;
    customUnitPolicyID?: string;

    /** Distance in meters of the alternate map route the user picked, so the backend doesn't fall back to primary route */
    selectedRouteDistance?: number;

    /** When true, the backend defers auto-submit so batch expense creation (e.g. duplicate report) can finish before the report is submitted */
    shouldDeferAutoSubmit?: boolean;
};

export default CreateDistanceRequestParams;
