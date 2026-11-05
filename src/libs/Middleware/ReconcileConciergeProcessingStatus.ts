/**
 * Reconciles an optimistic Concierge indicator with the reply destination and display decision
 * returned by AddComment or an attachment request. Empty report snapshots do not finish a turn.
 */
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';

const reconcileConciergeProcessingStatus: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const reportID = request.conciergeProcessingReportID;
        const reportActionID = request.data?.reportActionID;
        if (!reportID || typeof reportActionID !== 'string') {
            return response;
        }

        const status = response?.conciergeProcessingStatus;
        if ((response && response.jsonCode !== CONST.JSON_CODE.SUCCESS) || status?.isProcessing === false) {
            AgentZeroOptimisticStore.complete(reportID, CONST.ACCOUNT_ID.CONCIERGE, reportActionID);
        } else if (status?.reportActionID === reportActionID) {
            AgentZeroOptimisticStore.move(reportID, status.reportID, CONST.ACCOUNT_ID.CONCIERGE, reportActionID);
        }
        return response;
    });

export default reconcileConciergeProcessingStatus;
