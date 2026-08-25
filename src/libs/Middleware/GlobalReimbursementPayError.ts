import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that detects the Corpay pay modal signal sent by the backend when a pay attempt fails because the
 * workspace USD VBBA is not set up on Corpay. The backend sends an Onyx SET on corpayPayModal instead of writing
 * an inline error onto the report action. The client still runs its existing failureData to revert the report
 * state, but the failureData entry that would tag the optimistic PAY action with an error is rewritten here so the
 * orphan optimistic PAY action is cleanly removed (merged to null) instead of showing a red error.
 */
const GlobalReimbursementPayError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        const onyxData = response?.onyxData ?? [];
        const hasCorpayPayModal = onyxData.some((update) => update.key === ONYXKEYS.CORPAY_PAY_MODAL);

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
            // removed instead of being tagged with a red error.
            const value = update.value;
            if (isRecord(value)) {
                value[reportActionID] = null;
            }

            return update;
        });

        Log.info('GlobalReimbursementPayError: replaced optimistic PAY action-error with action-null for corpayPayModal', false, {iouReportID, reportActionID});

        return response;
    });

export default GlobalReimbursementPayError;
