import checkFileExists from '@libs/fileDownload/checkFileExists';
import ReceiptStorage from '@libs/ReceiptStorage';

import type {CanRetryReceipt} from './types';

/** The stored source may name a path from before an app upgrade, so resolve it against the current container first. */
const canRetryReceipt: CanRetryReceipt = (source) => {
    if (!source) {
        return Promise.resolve(false);
    }
    return checkFileExists(ReceiptStorage.resolve(source));
};

export default canRetryReceipt;
