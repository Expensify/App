import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: File;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    isSameReceipt?: boolean;
};

export default ReplaceReceiptParams;
