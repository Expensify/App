import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that detects the Corpay pay modal signal sent by the backend when a pay attempt fails because the
 * workspace USD VBBA is not set up on Corpay. The backend sends an Onyx SET on corpayPayModal instead of writing
 * an inline error onto the report action.
 */
const GlobalReimbursementPayError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (request?.command !== WRITE_COMMANDS.PAY_MONEY_REQUEST && request?.command !== WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET) {
            return response;
        }

        const onyxData = response?.onyxData ?? [];
        const hasCorpayPayModal = onyxData.some((update) => update.key === ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);

        if (!hasCorpayPayModal) {
            return response;
        }

        const iouReportID = request?.data?.iouReportID;
        const reportActionID = request?.data?.reportActionID;

        if (typeof iouReportID !== 'string' || typeof reportActionID !== 'string' || !request?.failureData) {
            return response;
        }

        const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`;
        request.failureData = request.failureData.map((update) => {
            if (update.key !== actionsKey) {
                return update;
            }

            // Replace the action-error merge with an action-null merge so the orphan optimistic PAY action is
            // removed instead of being tagged with a red error. Widened to AnyOnyxUpdate (matches the pattern used
            // by Pagination/HandleUnusedOptimisticID) so the union-typed value can be indexed without an unsafe
            // narrowing cast. Object.assign avoids member access on the `any` value.
            const widened = update as AnyOnyxUpdate;
            if (widened.value) {
                Object.assign(widened.value, {[reportActionID]: null});
            }

            return update;
        });

        Log.info('GlobalReimbursementPayError: replaced optimistic PAY action-error with action-null for corpayPayModal', false, {iouReportID, reportActionID});

        return response;
    });

export default GlobalReimbursementPayError;
