import Log from '@libs/Log';

import type {RequestMoneyInformation} from '@userActions/IOU/MoneyRequestBuilder';
import {requestMoney} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';

import canRetryReceipt from './canRetryReceipt';
import resolveReceiptFile from './resolveReceiptFile';

type RetryOutcome = 'dispatched' | 'fileMissing' | 'unusableParams' | 'unsupportedAction';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `transactionParams` and `participantParams` together are unique to a money-request payload among the four retry shapes. */
function isRequestMoneyInformation(value: unknown): value is RequestMoneyInformation {
    return isRecord(value) && isRecord(value.transactionParams) && isRecord(value.participantParams);
}

/** The params are stringified into the error by `getReceiptError`, so in practice this always parses a string. */
function parseRetryParams(retryParams: ReceiptError['retryParams']): RequestMoneyInformation | undefined {
    if (typeof retryParams !== 'string') {
        return isRequestMoneyInformation(retryParams) ? retryParams : undefined;
    }

    try {
        const parsed: unknown = JSON.parse(retryParams);
        return isRequestMoneyInformation(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function retryReceiptUpload(receiptError: ReceiptError, onBeforeDispatch?: () => void): Promise<RetryOutcome> {
    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.MONEY_REQUEST) {
        Log.hmmm('[ReceiptRetry] No retry path for this action', {action: receiptError.action});
        return Promise.resolve('unsupportedAction');
    }

    const retryParams = parseRetryParams(receiptError.retryParams);
    if (!retryParams) {
        Log.hmmm('[ReceiptRetry] Receipt error carries no usable retry params', {action: receiptError.action});
        return Promise.resolve('unusableParams');
    }

    return resolveReceiptFile(receiptError.source, receiptError.filename).then((file) => {
        if (!file) {
            Log.hmmm('[ReceiptRetry] Receipt file is no longer on the device, cannot retry', {source: receiptError.source});
            return 'fileMissing';
        }

        Log.info('[ReceiptRetry] Retrying receipt upload', false, {
            action: receiptError.action,
            transactionID: retryParams.optimisticTransactionID,
        });

        onBeforeDispatch?.();

        requestMoney({
            ...retryParams,
            isRetry: true,
            shouldPlaySound: false,
            transactionParams: {...retryParams.transactionParams, receipt: file},
        });

        return 'dispatched';
    });
}

export default retryReceiptUpload;
export {canRetryReceipt};
export type {RetryOutcome};
