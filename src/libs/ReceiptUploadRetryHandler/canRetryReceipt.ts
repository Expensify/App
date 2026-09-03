import type {CanRetryReceipt} from './types';

const canRetryReceipt: CanRetryReceipt = (source) => {
    if (!source) {
        return Promise.resolve(false);
    }
    return fetch(source)
        .then((response) => response.blob())
        .then((blob) => blob.size > 0)
        .catch(() => false);
};

export default canRetryReceipt;
