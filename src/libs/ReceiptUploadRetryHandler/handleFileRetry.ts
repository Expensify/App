import Onyx from 'react-native-onyx';
import * as IOU from '@userActions/IOU';
import {startSplitBill} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {OnyxCollection} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';
import {isReceiptError} from '@libs/ErrorUtils';

/**
 * Gets the set of error keys from all transactions that have receipt errors.
 * Each key is a combination of transactionID and error timestamp.
 */
function getReceiptErrorKeys(transactions: OnyxCollection<OnyxTypes.Transaction>): Set<string> {
    const errorKeys = new Set<string>();
    
    if (!transactions) {
        return errorKeys;
    }

    Object.entries(transactions).forEach(([transactionKey, transaction]) => {
        if (!transaction?.errors) {
            return;
        }
        Object.entries(transaction.errors).forEach(([errorTimestamp, error]) => {
            if (isReceiptError(error)) {
                errorKeys.add(`${transactionKey}:${errorTimestamp}`);
            }
        });
    });

    return errorKeys;
}

/**
 * Sets up a subscription to detect when a retry action fails.
 * It tracks the initial error state and only triggers the modal when NEW errors appear
 * that weren't present when the subscription was set up.
 * 
 * @param setShouldShowErrorModal - Callback to show the error modal
 * @returns Cleanup function to disconnect the subscription
 */
function setupRetryErrorDetection(setShouldShowErrorModal: () => void): () => void {
    let hasDetectedNewError = false;
    let initialErrorKeys: Set<string> | null = null;
    let isInitialized = false;
    
    const connectionID = Onyx.connect({
        key: ONYXKEYS.COLLECTION.TRANSACTION,
        waitForCollectionCallback: true,
        callback: (transactions: OnyxCollection<OnyxTypes.Transaction>) => {
            // Skip if we've already detected a new error and shown the modal
            if (hasDetectedNewError) {
                return;
            }

            const currentErrorKeys = getReceiptErrorKeys(transactions);

            // On the first callback, capture the initial error state
            // This includes any pre-existing errors before the retry starts
            if (!isInitialized) {
                initialErrorKeys = currentErrorKeys;
                isInitialized = true;
                return;
            }

            // Check if there are any NEW errors that weren't in the initial state
            // This handles the case where dismissError() clears errors and then
            // the failed retry adds new ones
            if (initialErrorKeys) {
                const hasNewError = [...currentErrorKeys].some((key) => !initialErrorKeys?.has(key));
                
                if (hasNewError) {
                    hasDetectedNewError = true;
                    setShouldShowErrorModal();
                }
            }
        },
    });

    // Return cleanup function
    return () => {
        Onyx.disconnect(connectionID);
    };
}

export default function handleFileRetry(message: ReceiptError, file: File, dismissError: () => void, setShouldShowErrorModal: () => void) {
    const retryParams: IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation =
        typeof message.retryParams === 'string'
            ? (JSON.parse(message.retryParams) as IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation)
            : message.retryParams;

    // Set up error detection before calling the IOU action
    // This will detect if the retry fails and show the error modal
    const cleanup = setupRetryErrorDetection(setShouldShowErrorModal);

    // Set a timeout to clean up the subscription if no error is detected within 10 seconds
    // This prevents memory leaks if the retry succeeds
    const cleanupTimeoutId = setTimeout(() => {
        cleanup();
    }, 10000);

    const cleanupWithTimeout = () => {
        clearTimeout(cleanupTimeoutId);
        cleanup();
    };

    switch (message.action) {
        case CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT: {
            dismissError();
            const replaceReceiptParams = {...retryParams} as IOU.ReplaceReceipt;
            replaceReceiptParams.file = file;
            IOU.replaceReceipt(replaceReceiptParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL: {
            dismissError();
            const startSplitBillParams = {...retryParams} as IOU.StartSplitBilActionParams;
            startSplitBillParams.receipt = file;
            startSplitBillParams.shouldPlaySound = false;
            startSplitBill(startSplitBillParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            dismissError();
            const trackExpenseParams = {...retryParams} as IOU.CreateTrackExpenseParams;
            trackExpenseParams.transactionParams.receipt = file;
            trackExpenseParams.isRetry = true;
            trackExpenseParams.shouldPlaySound = false;
            IOU.trackExpense(trackExpenseParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            dismissError();
            const requestMoneyParams = {...retryParams} as IOU.RequestMoneyInformation;
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            requestMoneyParams.shouldPlaySound = false;
            IOU.requestMoney(requestMoneyParams);
            break;
        }
        default:
            cleanupWithTimeout();
            setShouldShowErrorModal();
            break;
    }
}
