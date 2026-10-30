/** Retries a failed receipt upload: finds the file, rebuilds the request, and sends it again. */
import Log from '@libs/Log';

import {replaceReceipt} from '@userActions/IOU/Receipt';
import {requestMoney, trackExpense} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ReceiptRetryContext, RetryOutcome} from './types';

import buildReplaceReceiptRetryPayload, {canBuildReplaceReceiptRetryPayload} from './buildReplaceReceiptRetryPayload';
import buildRetryPayload, {canBuildRetryPayload} from './buildRetryPayload';
import buildTrackExpenseRetryPayload, {canBuildTrackExpenseRetryPayload} from './buildTrackExpenseRetryPayload';
import resolveReceiptFile from './resolveReceiptFile';

type RetryFlow = {
    canBuild: (context: ReceiptRetryContext) => boolean;
    dispatch: (context: ReceiptRetryContext, receiptFile: FileObject) => boolean;
};

const RETRY_FLOWS: Partial<Record<string, RetryFlow>> = {
    [CONST.IOU.ACTION_PARAMS.MONEY_REQUEST]: {
        canBuild: canBuildRetryPayload,
        dispatch: (context, receiptFile) => {
            const payload = buildRetryPayload(context, receiptFile);
            if (!payload) {
                return false;
            }
            requestMoney({...payload, isRetry: true, shouldPlaySound: false});
            return true;
        },
    },
    [CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT]: {
        canBuild: canBuildReplaceReceiptRetryPayload,
        dispatch: (context, receiptFile) => {
            const payload = buildReplaceReceiptRetryPayload(context, receiptFile);
            if (!payload) {
                return false;
            }
            replaceReceipt(payload);
            return true;
        },
    },
    [CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE]: {
        canBuild: canBuildTrackExpenseRetryPayload,
        dispatch: (context, receiptFile) => {
            const payload = buildTrackExpenseRetryPayload(context, receiptFile);
            if (!payload) {
                return false;
            }
            trackExpense({...payload, isRetry: true, shouldPlaySound: false});
            return true;
        },
    },
};

function getRetryFlow(context: ReceiptRetryContext): RetryFlow | undefined {
    const {action} = context.receiptError;
    return action ? RETRY_FLOWS[action] : undefined;
}

function canRetryReceiptUpload(context: ReceiptRetryContext): boolean {
    return !!getRetryFlow(context)?.canBuild(context);
}

function retryReceiptUpload(context: ReceiptRetryContext, onDispatched?: () => Promise<unknown>): Promise<RetryOutcome> {
    const {receiptError} = context;
    const flow = getRetryFlow(context);

    if (!flow) {
        Log.hmmm('[ReceiptRetry] No retry path for this action', {action: receiptError.action});
        return Promise.resolve('unsupportedAction');
    }

    if (!flow.canBuild(context)) {
        Log.hmmm('[ReceiptRetry] The failed expense does not hold enough to rebuild the request', {action: receiptError.action, transactionID: context.transaction?.transactionID});
        return Promise.resolve('payloadIncomplete');
    }

    return resolveReceiptFile(receiptError.source, receiptError.filename).then((receiptFile): RetryOutcome | Promise<RetryOutcome> => {
        if (!receiptFile) {
            Log.hmmm('[ReceiptRetry] Receipt file is no longer on the device, cannot retry', {source: receiptError.source});
            return 'fileMissing';
        }

        const transactionID = context.transaction?.transactionID;
        Log.info('[ReceiptRetry] Retrying receipt upload', false, {action: receiptError.action, transactionID});

        try {
            if (!flow.dispatch(context, receiptFile)) {
                Log.hmmm('[ReceiptRetry] The failed expense does not hold enough to rebuild the request', {action: receiptError.action, transactionID});
                return 'payloadIncomplete';
            }
        } catch (error) {
            Log.alert('[ReceiptRetry] Dispatching the retry threw', {action: receiptError.action, transactionID, error});
            return 'dispatchFailed';
        }

        // Cleared only after a dispatch, so a failure above keeps the error and its Try again and Save buttons.
        return Promise.resolve(onDispatched?.()).then((): RetryOutcome => 'dispatched');
    });
}

export default retryReceiptUpload;
export {canRetryReceiptUpload};
