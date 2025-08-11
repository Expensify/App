import Log from '@libs/Log';
import CONST from '@src/CONST';

type TransactionThreadParams = {
    parentReportID?: string;
    parentReportActionID?: string;
};

/**
 * Sets transaction thread parameters in session storage
 */
function setParams(params: TransactionThreadParams): void {
    try {
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.TRANSACTION_THREAD_PARAMS, JSON.stringify(params));
    } catch (error) {
        Log.warn('Failed to set transaction thread params in sessionStorage:');
    }
}

/**
 * Gets transaction thread parameters from session storage
 */
function getParams(): TransactionThreadParams {
    try {
        const storedParams = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.TRANSACTION_THREAD_PARAMS);
        if (!storedParams) {
            return {};
        }
        return JSON.parse(storedParams) as TransactionThreadParams;
    } catch (error) {
        // Return empty object if parsing fails or sessionStorage is not available
        Log.warn('Failed to get transaction thread params from sessionStorage:');
        return {};
    }
}

export default {
    setParams,
    getParams,
};

export type {TransactionThreadParams};
