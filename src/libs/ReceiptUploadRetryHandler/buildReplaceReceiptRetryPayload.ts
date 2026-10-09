/** Decides whether a failed `ReplaceReceipt` can be retried and rebuilds the call from Onyx. */
import {isLocalFile} from '@libs/fileDownload/FileUtils';

import type {ReplaceReceipt, ReplaceReceiptRetryParams} from '@userActions/IOU/Receipt';

import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ValueOf} from 'type-fest';

import type {ReceiptRetryContext} from './types';

import isRetrySupported from './isRetrySupported';

type StoredReplaceReceiptRetryParams = Pick<ReplaceReceiptRetryParams, 'transactionID' | 'state' | 'isSameReceipt' | 'receiptAddedReportActionID'>;

const RECEIPT_STATES = new Set<unknown>(Object.values(CONST.IOU.RECEIPT_STATE));

function isReceiptState(value: unknown): value is ValueOf<typeof CONST.IOU.RECEIPT_STATE> {
    return RECEIPT_STATES.has(value);
}

function parseRetryParams(retryParams: ReceiptError['retryParams']): unknown {
    if (typeof retryParams !== 'string') {
        return retryParams;
    }
    try {
        return JSON.parse(retryParams);
    } catch {
        return undefined;
    }
}

function getReplaceReceiptRetryParams(receiptError: ReceiptError): StoredReplaceReceiptRetryParams | undefined {
    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT) {
        return undefined;
    }

    const parsed = parseRetryParams(receiptError.retryParams);
    if (!parsed || typeof parsed !== 'object' || !('transactionID' in parsed) || typeof parsed.transactionID !== 'string') {
        return undefined;
    }

    return {
        transactionID: parsed.transactionID,
        state: 'state' in parsed && isReceiptState(parsed.state) ? parsed.state : undefined,
        isSameReceipt: 'isSameReceipt' in parsed && parsed.isSameReceipt === true ? true : undefined,
        receiptAddedReportActionID: 'receiptAddedReportActionID' in parsed && typeof parsed.receiptAddedReportActionID === 'string' ? parsed.receiptAddedReportActionID : undefined,
    };
}

function canBuildReplaceReceiptRetryPayload(context: ReceiptRetryContext): boolean {
    const {transaction, receiptError} = context;
    if (!isRetrySupported || !transaction?.transactionID || !isLocalFile(receiptError.source)) {
        return false;
    }

    return getReplaceReceiptRetryParams(receiptError)?.transactionID === transaction.transactionID;
}

function buildReplaceReceiptRetryPayload(context: ReceiptRetryContext, receiptFile: FileObject): ReplaceReceipt | undefined {
    const {
        transaction,
        receiptError,
        policyParams,
        transactionReport,
        transactionThreadReport,
        transactionViolations,
        isVendorMatchingBetaEnabled,
        delegateAccountID,
        currentUserPersonalDetails,
    } = context;
    const retryParams = getReplaceReceiptRetryParams(receiptError);
    if (!canBuildReplaceReceiptRetryPayload(context) || !retryParams) {
        return undefined;
    }

    return {
        transaction,
        // `replaceReceipt` only reads `FileObject` fields; native callers pass this same shape, cast to `File` the same way.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        file: receiptFile as File,
        source: receiptError.source,
        state: retryParams.state,
        isSameReceipt: retryParams.isSameReceipt,
        receiptAddedReportActionID: retryParams.receiptAddedReportActionID,
        transactionPolicy: policyParams.policy,
        transactionPolicyCategories: policyParams.policyCategories,
        transactionPolicyTagList: policyParams.policyTagList,
        transactionViolations,
        transactionReport,
        transactionThreadReport,
        isVendorMatchingBetaEnabled,
        delegateAccountID,
        currentUserPersonalDetails,
    };
}

export default buildReplaceReceiptRetryPayload;
export {canBuildReplaceReceiptRetryPayload};
