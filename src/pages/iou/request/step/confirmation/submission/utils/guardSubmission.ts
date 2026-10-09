import {getSpan} from '@libs/telemetry/activeSpans';

import type {CreateTransactionParams} from '@pages/iou/request/step/confirmation/submission/types';
import type {SubmitLock} from '@pages/iou/request/step/confirmation/submission/useSubmitLock';

import CONST from '@src/CONST';

/**
 * Wraps a submission path's `createTransaction` with the steps every path runs first: tag the submit span, let a
 * distance block stop it, and take the submit lock so a second tap can't submit again.
 */
function guardSubmission(submitLock: SubmitLock, submit: (params: CreateTransactionParams) => boolean, blockDistanceRequestIfNeeded?: () => boolean) {
    return (params: CreateTransactionParams): boolean => {
        getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE);
        if (blockDistanceRequestIfNeeded?.()) {
            return false;
        }

        if (!submitLock.acquireSubmitLock()) {
            return false;
        }

        // Telemetry spans (SPAN_SUBMIT_EXPENSE, SPAN_SUBMIT_TO_DESTINATION_VISIBLE)
        // are started by SubmitExpenseOrchestrator before calling createTransaction.
        return submit(params);
    };
}

export default guardSubmission;
