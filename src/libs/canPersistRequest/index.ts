/**
 * Whether a queued request can be written to storage and still be sent after a reload. On web a request holding a
 * File or Blob can't: IndexedDB fails to store it, and its blob URL is gone after a reload anyway.
 */
import type CanPersistRequest from './types';

const canPersistRequest: CanPersistRequest = (request) => {
    if (!request?.data) {
        return true;
    }

    return !Object.values(request.data).some((value) => {
        const isFile = typeof File !== 'undefined' && value instanceof File;
        const isBlob = typeof Blob !== 'undefined' && value instanceof Blob;
        return isFile || isBlob;
    });
};

export default canPersistRequest;
