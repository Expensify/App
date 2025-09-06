import isFileUploadable from '@libs/isFileUploadable';
import isReceiptUploadable from '@libs/isReceiptUploadable';
import validateFormDataParameter from '@libs/validateFormDataParameter';
import type {Receipt} from '@src/types/onyx/Transaction';
import type PrepareRequestPayload from './types';

/**
 * Prepares the request payload (body) for a given command and data.
 */
const prepareRequestPayload: PrepareRequestPayload = (command, data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value === undefined) {
            return;
        }

        // Process receipt for web platform - pure Receipt approach
        if (key === 'receipt') {
            const receiptValue = value as Receipt;
            
            // Use dedicated receipt validation - pure Receipt approach
            if (!isReceiptUploadable(receiptValue)) {
                // Handle invalid receipt
                validateFormDataParameter(command, key, value, isReceiptUploadable);
                formData.append(key, value as string | Blob);
                return;
            }
            
            // Pure Receipt validation and direct FormData append
            validateFormDataParameter(command, key, receiptValue, isReceiptUploadable);
            
            // For web, Receipt.source should be a blob URL - append directly
            if (receiptValue.source) {
                formData.append(key, receiptValue.source as string | Blob);
                return;
            }
        }

        // Process file for web platform (original logic - uses isFileUploadable validation)
        // Explicit validation function for consistency (default behavior)
        validateFormDataParameter(command, key, value, isFileUploadable);
        formData.append(key, value as string | Blob);
    });

    return Promise.resolve(formData);
};

export default prepareRequestPayload;
