import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';

type TrackExpenseParams = {
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    iouReportID?: string;
    chatReportID: string | undefined;
    transactionID: string | undefined;
    reportActionID: string | undefined;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID?: string;
    optimisticReportID?: string;
    optimisticReportActionID?: string;
    receipt?: Receipt;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    category?: string;
    tag?: string;
    taxCode: string;
    taxAmount: number;
    billable?: boolean;
    reimbursable?: boolean;
    receiptGpsPoints?: string;
    transactionThreadReportID: string | undefined;
    createdReportActionIDForThread: string | undefined;
    waypoints?: string;
    actionableWhisperReportActionID?: string;
    customUnitRateID?: string;
    description?: string;
    distance?: number;
};

export default TrackExpenseParams;
