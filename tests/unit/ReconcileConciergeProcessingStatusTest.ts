import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import reconcileConciergeProcessingStatus from '@libs/Middleware/ReconcileConciergeProcessingStatus';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

const REPORT_ID = '100';
const SERVER_REPORT_ID = '200';
const ACTION_ID = '300';
const NEXT_ACTION_ID = '400';
const AGENT_ID = CONST.ACCOUNT_ID.CONCIERGE;
const request: Request<never> = {
    command: WRITE_COMMANDS.ADD_COMMENT,
    data: {reportActionID: ACTION_ID},
    conciergeProcessingReportID: REPORT_ID,
};

describe('ReconcileConciergeProcessingStatus', () => {
    afterEach(() => {
        AgentZeroOptimisticStore.clear(REPORT_ID, AGENT_ID);
        AgentZeroOptimisticStore.clear(SERVER_REPORT_ID, AGENT_ID);
    });

    it.each([ACTION_ID, NEXT_ACTION_ID])('recovers completion from pagination without clearing a newer turn: %s', async (pendingActionID) => {
        // Given a tracked send whose completion event was missed.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, pendingActionID);

        // When reconnect pagination recovers completion for the requested message.
        await reconcileConciergeProcessingStatus(
            Promise.resolve({
                jsonCode: 200,
                conciergeProcessingStatus: {reportID: REPORT_ID, reportActionID: ACTION_ID, isProcessing: false},
            }),
            {command: READ_COMMANDS.GET_NEWER_ACTIONS, data: {reportActionID: 'cursor', conciergeReportActionID: ACTION_ID}},
            false,
        );

        // Then only that message is retired; a send made during the fetch remains pending.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)?.triggeringReportActionID).toBe(pendingActionID === ACTION_ID ? undefined : NEXT_ACTION_ID);
    });

    it.each<Response<never>>([
        {
            jsonCode: 200,
            conciergeProcessingStatus: {
                reportID: REPORT_ID,
                reportActionID: ACTION_ID,
                isProcessing: false,
            },
        },
        {jsonCode: 400},
    ])('retires the local turn when the server suppresses thinking or rejects the send: %j', async (response) => {
        // Given a message waiting locally before its HTTP response.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, ACTION_ID);

        // When the response does not confirm a visible Concierge run.
        await reconcileConciergeProcessingStatus(Promise.resolve(response), request, false);

        // Then no optimistic label remains waiting for a reply that may never arrive.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)).toBeUndefined();
    });

    it('keeps a pending turn when an idempotent retry returns no new processing decision', async () => {
        // Given the original send started a run whose completion has not arrived.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, ACTION_ID);

        // When a duplicate request returns success without dispatching a second job.
        await reconcileConciergeProcessingStatus(Promise.resolve({jsonCode: 200}), request, false);

        // Then the original pending turn remains until its completion or safety timeout.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)?.triggeringReportActionID).toBe(ACTION_ID);
    });

    it('keeps the turn pending when the attachment fails but Concierge is processing the text', async () => {
        // Given a pending send with text and an attachment.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, ACTION_ID);

        // When the upload error also confirms Concierge is processing the saved text.
        const response = {jsonCode: 400, conciergeProcessingStatus: {reportID: REPORT_ID, reportActionID: ACTION_ID, isProcessing: true}};
        await reconcileConciergeProcessingStatus(Promise.resolve(response), {...request, command: WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT}, false);

        // Then the indicator still waits for the worker's completion.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)?.triggeringReportActionID).toBe(ACTION_ID);
    });

    it('moves pending state to the actual reply destination without extending its timeout', async () => {
        // Given the client predicted a new thread before the server chose an existing destination.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, ACTION_ID);
        const entry = AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID);

        // When the server confirms the run on a different report.
        await reconcileConciergeProcessingStatus(
            Promise.resolve({
                jsonCode: 200,
                conciergeProcessingStatus: {
                    reportID: SERVER_REPORT_ID,
                    reportActionID: ACTION_ID,
                    isProcessing: true,
                },
            }),
            request,
            false,
        );

        // Then the same pending turn and original start time belong to that destination.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)).toBeUndefined();
        expect(AgentZeroOptimisticStore.getEntry(SERVER_REPORT_ID, AGENT_ID)).toEqual({...entry, reportID: SERVER_REPORT_ID});
    });

    it('keeps a newer send pending when an older request fails', async () => {
        // Given a second message was sent while the first HTTP request was in flight.
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, ACTION_ID);
        AgentZeroOptimisticStore.increment(REPORT_ID, AGENT_ID, null, NEXT_ACTION_ID);

        // When the first request is rejected.
        await reconcileConciergeProcessingStatus(Promise.resolve({jsonCode: 400}), request, false);

        // Then its failure cannot retire the second message.
        expect(AgentZeroOptimisticStore.getEntry(REPORT_ID, AGENT_ID)?.triggeringReportActionID).toBe(NEXT_ACTION_ID);
    });
});
