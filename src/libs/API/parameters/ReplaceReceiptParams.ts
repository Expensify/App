import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: File;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
};

export default ReplaceReceiptParams;
