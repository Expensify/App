import {PAYMENT_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/** The report-total fields a pushed report update may carry, kept loose so it accepts any command's update. */
type PushedReportTotals = {
    total?: unknown;
    nonReimbursableTotal?: unknown;
    reimbursableTotal?: unknown;
    unheldTotal?: unknown;
    unheldNonReimbursableTotal?: unknown;
    unheldReimbursableTotal?: unknown;
};

/**
 * Mirrors how `getPayMoneyRequestParams` derives the amount it sends: the backend-computed reimbursable total when
 * paying the whole report, and the unheld reimbursable total when paying a part. See `getReimbursableTotal` /
 * `getUnheldReimbursableTotal` in ReportUtils for the canonical versions. Returns `null` when the pushed update
 * carries no total fields at all, so an unrelated report update (e.g. just a statusNum flip) is never mistaken for
 * evidence that the amount changed.
 */
function derivePushedReportTotal(value: Record<string, unknown>, payFullReport: boolean): number | null {
    const report = value as PushedReportTotals;
    if (payFullReport) {
        if (typeof report.reimbursableTotal === 'number') {
            return report.reimbursableTotal;
        }
        return typeof report.total === 'number' || typeof report.nonReimbursableTotal === 'number'
            ? (report.total ?? 0) - (report.nonReimbursableTotal ?? 0)
            : null;
    }
    if (typeof report.unheldReimbursableTotal === 'number') {
        return report.unheldReimbursableTotal;
    }
    return typeof report.unheldTotal === 'number' || typeof report.unheldNonReimbursableTotal === 'number'
        ? (report.unheldTotal ?? 0) - (report.unheldNonReimbursableTotal ?? 0)
        : null;
}

/**
 * A report is paid with the total computed from the locally cached report. When the backend rejects the pay because the
 * report total has changed, it pushes the refreshed report (with its new total) in the failure response. Two things
 * have to happen for the payer to escape the dead-end: the pushed total must not be clobbered by the stale snapshot the
 * optimistic pay's failureData restores (handled by the scoped failure restore in getPayMoneyRequestParams), and the
 * generic "unexpected error" must be replaced with one that tells the payer the amount changed so they review the new
 * total instead of retrying the stale amount forever.
 */
const HandleStaleTotalPayError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (!request?.command || !PAYMENT_COMMANDS.has(request.command) || !response || response.jsonCode === CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        const iouReportID = request?.data?.iouReportID;
        const reportActionID = request?.data?.reportActionID;
        const sentAmount = request?.data?.amount;

        if (typeof iouReportID !== 'string' || typeof reportActionID !== 'string' || typeof sentAmount !== 'number' || !request?.failureData) {
            return response;
        }

        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`;
        const pushedReportUpdate = response.onyxData?.find((update) => update.key === reportKey);

        if (!pushedReportUpdate || !isRecord(pushedReportUpdate.value)) {
            return response;
        }

        // The pushed total is only evidence that the amount changed if it differs from the amount the payer sent.
        const payFullReport = request.data?.full !== false;
        const pushedTotal = derivePushedReportTotal(pushedReportUpdate.value, payFullReport);
        if (pushedTotal === null || Math.abs(pushedTotal) === Math.abs(sentAmount)) {
            return response;
        }

        const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`;
        const amountChangedError = getMicroSecondOnyxErrorWithTranslationKey('iou.error.amountChanged', 0);
        for (const update of request.failureData as AnyOnyxUpdate[]) {
            if (update.key !== actionsKey || !isRecord(update.value)) {
                continue;
            }

            const actionUpdate = update.value[reportActionID];
            if (!isRecord(actionUpdate)) {
                continue;
            }

            update.value = {
                ...update.value,
                [reportActionID]: {
                    ...actionUpdate,
                    errors: amountChangedError,
                },
            };
        }

        Log.info('HandleStaleTotalPayError: replaced generic pay error with amountChanged error', false, {iouReportID, reportActionID, sentAmount, pushedTotal, payFullReport});

        return response;
    });

export default HandleStaleTotalPayError;