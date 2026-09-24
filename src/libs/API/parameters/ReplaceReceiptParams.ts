import type CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';

import type {ValueOf} from 'type-fest';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: Receipt;
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    isSameReceipt?: boolean;
};

export default ReplaceReceiptParams;
