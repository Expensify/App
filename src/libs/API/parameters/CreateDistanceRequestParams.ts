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
    splits?: string;
    chatType?: string;
    description?: string;
    attendees?: string;
    distance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
    customUnitPolicyID?: string;

    /** When true, the backend defers auto-submit so batch expense creation (e.g. duplicate report) can finish before the report is submitted */
    shouldDeferAutoSubmit?: boolean;
};

export default CreateDistanceRequestParams;
