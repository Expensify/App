import {settleGlobalReimbursementsBulkPayReport} from '@libs/actions/GlobalReimbursementsBulkPay';
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
 * Middleware that detects the global reimbursements signal sent by the backend when a pay attempt fails because the
 * bank account isn't set up for global reimbursements (Corpay or Wise). The backend sends an Onyx SET on
 * enableGlobalReimbursementsModal instead of writing an inline error onto the report action. The setup explains the
 * rejection, so the middleware drops the failed PAY action and the report error.
 *
 * It also tells Search bulk pay how each of its payments ended, and holds the signal back for them, so one modal lists
 * the unpaid reports of a click instead of the setup opening once per rejected report.
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
        const isBulkPayRequest =
            typeof iouReportID === 'string' && settleGlobalReimbursementsBulkPayReport(iouReportID, {isPaid, needsGlobalReimbursements: !!enableGlobalReimbursementsModalUpdate});

        if (!enableGlobalReimbursementsModalUpdate) {
            return response;
        }

        if (isBulkPayRequest) {
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

            // Search pay adds a generic error to the report when the payment fails. The global reimbursements setup explains this
            // rejection instead, and the Search row has no way to dismiss the error.
            if (update.key === reportKey && 'errors' in update.value) {
                const {errors, ...reportValue} = update.value;
                update.value = reportValue;
            }
        }

        Log.info('GlobalReimbursementPayError: dropped the optimistic PAY action and the report error for enableGlobalReimbursementsModal', false, {
            iouReportID,
            reportActionID,
            isBulkPayRequest,
        });

        return response;
    });

export default GlobalReimbursementPayError;
