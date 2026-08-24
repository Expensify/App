import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that detects the Corpay pay modal signal sent by the backend when a pay attempt fails because the
 * workspace USD VBBA is not set up on Corpay. The backend sends an Onyx SET on corpayPayModal instead of writing
 * an inline error onto the report action. The client still runs its existing failureData to revert the report
 * state, but the failureData entry that would tag the optimistic PAY action with an error is replaced here with an
 * action-null so the orphan optimistic PAY action is cleanly removed instead of showing a red error.
 */
const GlobalReimbursementPayError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        const onyxData = response?.onyxData ?? [];
        const hasCorpayPayModal = onyxData.some((update) => update.key === ONYXKEYS.CORPAY_PAY_MODAL);

        if (!hasCorpayPayModal) {
            return response;
        }

        const iouReportID = request?.data?.iouReportID as string | undefined;
        const reportActionID = request?.data?.reportActionID as string | undefined;

        if (!iouReportID || !reportActionID || !request?.failureData) {
            return response;
        }

        const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`;
        request.failureData = request.failureData.map((update) => {
            if (update.key !== actionsKey) {
                return update;
            }

            return {
                ...update,
                value: {
                    [reportActionID]: null,
                },
            } as OnyxUpdate<TKey>;
        });

        Log.info('GlobalReimbursementPayError: replaced optimistic PAY action-error with action-null for corpayPayModal', false, {iouReportID, reportActionID});

        return response;
    });

export default GlobalReimbursementPayError;
