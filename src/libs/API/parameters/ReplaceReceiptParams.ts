import type {Receipt} from '@src/types/onyx/Transaction';

type ReplaceReceiptParams = {
    transactionID: string;
    receipt: Receipt;
};

export default ReplaceReceiptParams;
