import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: File;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    isSameReceipt?: boolean;
};

export default ReplaceReceiptParams;
