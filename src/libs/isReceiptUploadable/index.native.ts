import type {Receipt} from '@src/types/onyx/Transaction';

/**
 * Validates if a Receipt object is uploadable for native platforms.
 * Native implementation checks for valid source (file:// paths).
 * 
 * @param receipt - Receipt object to validate
 * @returns true if receipt can be uploaded, false otherwise
 */
function isReceiptUploadable(receipt: Receipt | undefined): boolean {
    if (!receipt || typeof receipt !== 'object') {
        return false;
    }

    // Receipt must have a valid source (file path)
    if (!receipt.source || typeof receipt.source !== 'string' || receipt.source.length === 0) {
        return false;
    }

    return true;
}

export default isReceiptUploadable;