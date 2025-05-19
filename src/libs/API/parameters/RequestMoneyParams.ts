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
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
    reimbursible?: boolean;
    description?: string;
    attendees?: string;
};

export default RequestMoneyParams;
