import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: File;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
};

export default ReplaceReceiptParams;
