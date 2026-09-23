import Log from '@libs/Log';

import {requestMoney} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';

import type {ReceiptRetryContext, RetryOutcome} from './types';

import buildRetryPayload, {canBuildRetryPayload} from './buildRetryPayload';
import resolveReceiptFile from './resolveReceiptFile';

function retryReceiptUpload(context: ReceiptRetryContext, onBeforeDispatch?: () => Promise<unknown>): Promise<RetryOutcome> {
    const {receiptError} = context;

    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.MONEY_REQUEST) {
        Log.hmmm('[ReceiptRetry] No retry path for this action', {action: receiptError.action});
        return Promise.resolve('unsupportedAction');
    }

    if (!canBuildRetryPayload(context)) {
        Log.hmmm('[ReceiptRetry] The failed expense does not hold enough to rebuild the request', {transactionID: context.transaction?.transactionID});
        return Promise.resolve('payloadIncomplete');
    }

    return resolveReceiptFile(receiptError.source, receiptError.filename).then((receiptFile) => {
        if (!receiptFile) {
            Log.hmmm('[ReceiptRetry] Receipt file is no longer on the device, cannot retry', {source: receiptError.source});
            return 'fileMissing';
        }

        return Promise.resolve(onBeforeDispatch?.()).then(() => {
            const payload = buildRetryPayload(context, receiptFile);
            if (!payload) {
                Log.hmmm('[ReceiptRetry] The failed expense does not hold enough to rebuild the request', {transactionID: context.transaction?.transactionID});
                return 'payloadIncomplete';
            }

            Log.info('[ReceiptRetry] Retrying receipt upload', false, {
                action: receiptError.action,
                transactionID: payload.optimisticTransactionID,
            });

            try {
                requestMoney({...payload, isRetry: true, shouldPlaySound: false});
            } catch (error) {
                Log.alert('[ReceiptRetry] Dispatching the retry threw', {transactionID: payload.optimisticTransactionID, error});
                return 'dispatchFailed';
            }

            return 'dispatched';
        });
    });
}

export default retryReceiptUpload;
export {canBuildRetryPayload};
