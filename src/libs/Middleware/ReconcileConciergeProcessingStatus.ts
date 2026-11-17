/**
 * Reconciles an optimistic Concierge indicator with the reply destination and display decision
 * that a send returns. Report snapshots without that decision do not finish a message.
 */
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';

const reconcileConciergeProcessingStatus: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        // A failed attachment upload can still carry the decision for the text the server accepted, so the
        // decision wins over the error code below.
        const status = response?.conciergeProcessingStatus;
        if (status) {
            AgentZeroOptimisticStore.reconcile(status);
            return response;
        }

        const reportID = request.conciergeProcessingReportID;
        const reportActionID = request.data?.reportActionID;
        if (!reportID || typeof reportActionID !== 'string') {
            return response;
        }

        if (response && response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            AgentZeroOptimisticStore.completeTurn(reportActionID);
        }
        return response;
    });

export default reconcileConciergeProcessingStatus;
