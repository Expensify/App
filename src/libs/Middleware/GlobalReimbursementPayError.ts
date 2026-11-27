import {settleGlobalReimbursementsBulkPayReport} from '@libs/actions/GlobalReimbursementsBulkPay';
import {settlePaymentWithoutWiseQuote} from '@libs/actions/PaymentsWithoutWiseQuote';
import {PAYMENT_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that detects the global reimbursements signals sent by the backend instead of writing an inline error onto the report action:
 * - enableGlobalReimbursementsModal, when a pay attempt fails because the bank account isn't set up for global reimbursements (Corpay or Wise).
 *   The setup explains the rejection.
 * - wiseQuoteRequired, when a pay attempt without a Wise quote fails because the payment converts currency. App shows the quote and pays again.
 * Either way the middleware drops the failed PAY action and the report error.
 *
 * It also tells Search bulk pay how each of its payments ended, and holds the signals back for them, so one modal lists
 * the unpaid reports of a click instead of the setup opening once per rejected report. A bulk payment that needs a quote keeps its error.
 */
const GlobalReimbursementPayError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (!request?.command || !PAYMENT_COMMANDS.has(request.command) || !response) {
            return response;
        }

        const iouReportID = request?.data?.iouReportID;
        const reportActionID = request?.data?.reportActionID;
        const isPaid = response.jsonCode === CONST.JSON_CODE.SUCCESS;
        const enableGlobalReimbursementsModalUpdate = isPaid ? undefined : response.onyxData?.find((update) => update.key === ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL);
        const wiseQuoteRequiredUpdate = isPaid ? undefined : response.onyxData?.find((update) => update.key === ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED);
        const isBulkPayRequest =
            typeof iouReportID === 'string' && settleGlobalReimbursementsBulkPayReport(iouReportID, {isPaid, needsGlobalReimbursements: !!enableGlobalReimbursementsModalUpdate});

        // Only a payment this tab sent can be paid again with a quote, and bulk pay doesn't open one quote per report
        const isPaidAgainWithQuote = typeof iouReportID === 'string' && settlePaymentWithoutWiseQuote(iouReportID, !!wiseQuoteRequiredUpdate && !isBulkPayRequest);
        if (wiseQuoteRequiredUpdate && !isPaidAgainWithQuote) {
            response.onyxData = response.onyxData?.filter((update) => update !== wiseQuoteRequiredUpdate);
        }

        if (!enableGlobalReimbursementsModalUpdate && !isPaidAgainWithQuote) {
            return response;
        }

        if (isBulkPayRequest && enableGlobalReimbursementsModalUpdate) {
            response.onyxData = response.onyxData?.filter((update) => update !== enableGlobalReimbursementsModalUpdate);
        }

        if (typeof iouReportID !== 'string' || typeof reportActionID !== 'string' || !request?.failureData) {
            return response;
        }

        const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`;
        for (const update of request.failureData as AnyOnyxUpdate[]) {
            if (!isRecord(update.value)) {
                continue;
            }

            if (update.key === actionsKey) {
                // Drop the optimistic PAY action instead of merging an error onto it.
                update.value = {
                    ...update.value,
                    [reportActionID]: null,
                };
                continue;
            }

            // Search pay adds a generic error to the report when the payment fails. The global reimbursements setup or the quote explains this
            // rejection instead, and the Search row has no way to dismiss the error.
            if (update.key === reportKey && 'errors' in update.value) {
                const {errors, ...reportValue} = update.value;
                update.value = reportValue;
            }
        }

        Log.info('GlobalReimbursementPayError: dropped the optimistic PAY action and the report error for a global reimbursements signal', false, {
            iouReportID,
            reportActionID,
            isBulkPayRequest,
            isPaidAgainWithQuote,
        });

        return response;
    });

export default GlobalReimbursementPayError;
