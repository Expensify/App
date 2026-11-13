/**
 * Reconciles an optimistic Concierge indicator with the reply destination and display decision
 * returned by a send or recovered on reconnect. Empty report snapshots do not finish a turn.
 */
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';

const reconcileConciergeProcessingStatus: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const status = response?.conciergeProcessingStatus;
        if (status) {
            AgentZeroOptimisticStore.reconcile(status.reportID, CONST.ACCOUNT_ID.CONCIERGE, status.reportActionID, status.isProcessing);
            // An upload can fail after the server has accepted the text.
            return response;
        }

        const reportID = request.conciergeProcessingReportID;
        const reportActionID = request.data?.reportActionID;
        if (!reportID || typeof reportActionID !== 'string') {
            return response;
        }

        if (response && response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            AgentZeroOptimisticStore.complete(reportID, CONST.ACCOUNT_ID.CONCIERGE, reportActionID);
        }
        return response;
    });

export default reconcileConciergeProcessingStatus;
