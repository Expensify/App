import type {Receipt} from '@src/types/onyx/Transaction';

/**
 * Validates if a Receipt object is uploadable for web platform.
 * Web implementation checks for valid source (blob:// URLs or remote URLs).
 * 
 * @param receipt - Receipt object to validate
 * @returns true if receipt can be uploaded, false otherwise
 */
function isReceiptUploadable(receipt: Receipt | undefined): boolean {
    if (!receipt || typeof receipt !== 'object') {
        return false;
    }

    // Receipt must have a valid source (path or URL)
    if (!receipt.source || typeof receipt.source !== 'string' || receipt.source.length === 0) {
        return false;
    }

    return true;
}

export default isReceiptUploadable;