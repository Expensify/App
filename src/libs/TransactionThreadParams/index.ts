import Log from '@libs/Log';
import CONST from '@src/CONST';

type TransactionThreadParams = {
    parentReportID?: string;
    parentReportActionID?: string;
};

// Timer ID to automatically clear params after a delay
let clearTimer: NodeJS.Timeout | null = null;

/**
 * Sets transaction thread parameters in session storage
 * Automatically clears the params after 1000ms
 */
function setParams(params: TransactionThreadParams): void {
    try {
        // Clear any existing timer
        if (clearTimer) {
            clearTimeout(clearTimer);
            clearTimer = null;
        }

        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.TRANSACTION_THREAD_PARAMS, JSON.stringify(params));

        // Set a timer to automatically clear the params after 1000ms
        clearTimer = setTimeout(() => {
            clearParams();
            clearTimer = null;
        }, 1000);
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

function clearParams(): void {
    try {
        if (clearTimer) {
            clearTimeout(clearTimer);
            clearTimer = null;
        }

        sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.TRANSACTION_THREAD_PARAMS);
    } catch (error) {
        Log.warn('Failed to clear transaction thread params from sessionStorage:');
    }
}

export default {
    setParams,
    getParams,
    clearParams,
};

export type {TransactionThreadParams};
