import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {Receipt} from '@src/types/onyx/Transaction';

type SendMoneyParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    transactionID: string;
    newIOUReportDetails: string;
    createdReportActionID: string | undefined;
    reportPreviewReportActionID: string;
    createdIOUReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
    receipt?: Receipt;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
};

export default SendMoneyParams;
