import {WRITE_COMMANDS} from '@libs/API/types';
import reconcileBulkEditReportAction from '@libs/Middleware/ReconcileBulkEditReportAction';

import {getAll as getPersistedRequests} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@userActions/PersistedRequests', () => ({getAll: jest.fn(() => [])}));

const ACTION_ID = '100';
const BACKFILLED_ACTION_ID = 'backfilled-created';
const NEXT_ACTION_ID = 'next-action';
const LOCAL_THREAD_ID = '200';
const PARENT_REPORT_ID = '300';
const PARENT_ACTION_ID = '400';
const TRANSACTION_ID = '500';
const SERVER_THREAD_ID = '600';
const LOCAL_ACTIONS_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${LOCAL_THREAD_ID}` as const;
const LOCAL_REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}${LOCAL_THREAD_ID}` as const;
const PARENT_ACTIONS_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}` as const;
const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}` as const;

function makeRequest(createsThread = false, command: string = WRITE_COMMANDS.UPDATE_MONEY_REQUEST, includesActionID = true, actionID = ACTION_ID): Request<OnyxKey> {
    return {
        command,
        data: {transactionID: TRANSACTION_ID, ...(includesActionID ? {reportActionID: actionID} : {})},
        bulkEditActionContext: {
            actionID,
            threadReportID: LOCAL_THREAD_ID,
            parentReportID: PARENT_REPORT_ID,
            parentActionID: PARENT_ACTION_ID,
            isOptimisticThread: createsThread,
        },
        successData: [
            {onyxMethod: Onyx.METHOD.MERGE, key: TRANSACTION_KEY, value: {pendingFields: {merchant: null}}},
            {onyxMethod: Onyx.METHOD.MERGE, key: LOCAL_ACTIONS_KEY, value: {[actionID]: {pendingAction: null}, [BACKFILLED_ACTION_ID]: null}},
        ],
        failureData: createsThread
            ? [
                  {onyxMethod: Onyx.METHOD.MERGE, key: TRANSACTION_KEY, value: {transactionThreadReportID: null}},
                  {onyxMethod: Onyx.METHOD.MERGE, key: PARENT_ACTIONS_KEY, value: {[PARENT_ACTION_ID]: {childReportID: null}}},
                  {onyxMethod: Onyx.METHOD.SET, key: LOCAL_REPORT_KEY, value: null},
              ]
            : [],
    };
}

async function seedOptimisticAction() {
    await Onyx.update([
        {onyxMethod: Onyx.METHOD.MERGE, key: LOCAL_REPORT_KEY, value: {reportID: LOCAL_THREAD_ID, parentReportID: PARENT_REPORT_ID}},
        {onyxMethod: Onyx.METHOD.MERGE, key: LOCAL_ACTIONS_KEY, value: {[ACTION_ID]: {reportActionID: ACTION_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}},
        {onyxMethod: Onyx.METHOD.MERGE, key: PARENT_ACTIONS_KEY, value: {[PARENT_ACTION_ID]: {childReportID: LOCAL_THREAD_ID}}},
        {onyxMethod: Onyx.METHOD.MERGE, key: TRANSACTION_KEY, value: {transactionID: TRANSACTION_ID, merchant: 'New merchant', transactionThreadReportID: LOCAL_THREAD_ID}},
    ]);
}

async function applyResponse(request: Request<OnyxKey>, response: Response<OnyxKey>) {
    await reconcileBulkEditReportAction(Promise.resolve(response), request, false);
    await Onyx.update(response.onyxData ?? []);
    await Onyx.update(request.successData ?? []);
    await waitForBatchedUpdates();
}

describe('ReconcileBulkEditReportAction', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(getPersistedRequests).mockReturnValue([]);
        await Onyx.clear();
        await seedOptimisticAction();
    });

    it('does not reinsert an action after Auth deletes it from an existing thread', async () => {
        // Given an optimistic action with pending-state cleanup queued after the server response
        const request = makeRequest();
        const response = {
            jsonCode: 200,
            modifiedExpenseReportAction: null,
            transactionThreadReportID: Number(LOCAL_THREAD_ID),
            onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: LOCAL_ACTIONS_KEY, value: {[ACTION_ID]: null}}],
        };

        // When Auth confirms it skipped the action
        await applyResponse(request, response);

        // Then successData cannot recreate the deleted action
        expect((await getOnyxValue(LOCAL_ACTIONS_KEY))?.[ACTION_ID]).toBeFalsy();
        expect((await getOnyxValue(LOCAL_REPORT_KEY))?.reportID).toBe(LOCAL_THREAD_ID);
    });

    it('removes a locally created thread and its links when Auth never created one', async () => {
        // Given an expense whose transaction thread exists only in optimistic Onyx data
        const request = makeRequest(true);

        // When Auth reports that the edit created neither an action nor a thread
        await applyResponse(request, {jsonCode: 200, modifiedExpenseReportAction: null, transactionThreadReportID: 0});

        // Then the phantom thread and action disappear without reverting the edited transaction
        expect(await getOnyxValue(LOCAL_REPORT_KEY)).toBeFalsy();
        expect(await getOnyxValue(LOCAL_ACTIONS_KEY)).toBeFalsy();
        expect((await getOnyxValue(PARENT_ACTIONS_KEY))?.[PARENT_ACTION_ID]?.childReportID).toBeFalsy();
        expect((await getOnyxValue(TRANSACTION_KEY))?.transactionThreadReportID).toBeFalsy();
        expect((await getOnyxValue(TRANSACTION_KEY))?.merchant).toBe('New merchant');
    });

    it('preserves an action that Auth already persisted on an enabled retry', async () => {
        // Given a persisted action ID on an existing thread
        const request = makeRequest();

        // When Auth returns a null action but does not queue a deletion
        await applyResponse(request, {jsonCode: 200, modifiedExpenseReportAction: null, transactionThreadReportID: Number(LOCAL_THREAD_ID)});

        // Then the real action remains and its pending state clears
        const action = (await getOnyxValue(LOCAL_ACTIONS_KEY))?.[ACTION_ID];
        expect(action?.reportActionID).toBe(ACTION_ID);
        expect(action?.pendingAction).toBeFalsy();
    });

    it('retires a local thread when Auth creates a different canonical thread', async () => {
        // Given a locally created thread and optimistic action
        const request = makeRequest(true);
        const serverActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SERVER_THREAD_ID}` as const;

        // When Auth saves the edit under its own thread ID
        await applyResponse(request, {
            jsonCode: 200,
            modifiedExpenseReportAction: {reportActionID: ACTION_ID},
            transactionThreadReportID: Number(SERVER_THREAD_ID),
            onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: serverActionsKey, value: {[ACTION_ID]: {reportActionID: ACTION_ID}}}],
        });

        // Then only the canonical thread remains linked to the expense
        expect(await getOnyxValue(LOCAL_REPORT_KEY)).toBeFalsy();
        expect((await getOnyxValue(serverActionsKey))?.[ACTION_ID]?.reportActionID).toBe(ACTION_ID);
        expect((await getOnyxValue(PARENT_ACTIONS_KEY))?.[PARENT_ACTION_ID]?.childReportID).toBe(SERVER_THREAD_ID);
        expect((await getOnyxValue(TRANSACTION_KEY))?.transactionThreadReportID).toBe(SERVER_THREAD_ID);
    });

    it('removes an attendee-only optimistic action when no action ID was sent to Auth', async () => {
        // Given an attendee edit that created a thread locally but omitted reportActionID
        const request = makeRequest(true, WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES, false);

        // When Auth accepts the request without a transaction thread
        await applyResponse(request, {jsonCode: 200});

        // Then no optimistic action or thread remains
        expect(await getOnyxValue(LOCAL_ACTIONS_KEY)).toBeFalsy();
        expect(await getOnyxValue(LOCAL_REPORT_KEY)).toBeFalsy();
        expect((await getOnyxValue(TRANSACTION_KEY))?.transactionThreadReportID).toBeFalsy();
    });

    it('keeps a locally created thread until later queued edits using it have settled', async () => {
        // Given two offline edits using the same optimistic thread
        const firstRequest = makeRequest(true);
        const laterRequest = makeRequest(false, WRITE_COMMANDS.UPDATE_MONEY_REQUEST, true, NEXT_ACTION_ID);
        if (laterRequest.bulkEditActionContext) {
            laterRequest.bulkEditActionContext.isOptimisticThread = true;
        }
        jest.mocked(getPersistedRequests).mockReturnValueOnce([laterRequest]);
        await Onyx.merge(LOCAL_ACTIONS_KEY, {[NEXT_ACTION_ID]: {reportActionID: NEXT_ACTION_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}});

        // When Auth skips the first edit but the second still needs the thread
        await applyResponse(firstRequest, {jsonCode: 200, modifiedExpenseReportAction: null, transactionThreadReportID: 0});

        // Then only the first action is removed; the pending edit keeps its thread
        expect((await getOnyxValue(LOCAL_ACTIONS_KEY))?.[ACTION_ID]).toBeFalsy();
        expect((await getOnyxValue(LOCAL_ACTIONS_KEY))?.[NEXT_ACTION_ID]?.reportActionID).toBe(NEXT_ACTION_ID);
        expect((await getOnyxValue(LOCAL_REPORT_KEY))?.reportID).toBe(LOCAL_THREAD_ID);

        // When the final edit completes, the now-unused local thread is retired
        await applyResponse(laterRequest, {jsonCode: 200, modifiedExpenseReportAction: null, transactionThreadReportID: 0});
        expect(await getOnyxValue(LOCAL_REPORT_KEY)).toBeFalsy();
        expect((await getOnyxValue(PARENT_ACTIONS_KEY))?.[PARENT_ACTION_ID]?.childReportID).toBeFalsy();
    });

    it('leaves failed requests to their failureData and does not clear a real action', async () => {
        // Given a request that may fail or save its action
        const failedRequest = makeRequest(true);
        const savedRequest = makeRequest();

        // When the first request fails and Auth returns a real action for the second
        await reconcileBulkEditReportAction(Promise.resolve({jsonCode: 400}), failedRequest, false);
        await applyResponse(savedRequest, {jsonCode: 200, modifiedExpenseReportAction: {reportActionID: ACTION_ID}, transactionThreadReportID: Number(LOCAL_THREAD_ID)});

        // Then neither path deletes the action or replaces failureData
        expect(failedRequest.successData?.[1]?.value).toEqual({[ACTION_ID]: {pendingAction: null}, [BACKFILLED_ACTION_ID]: null});
        expect((await getOnyxValue(LOCAL_ACTIONS_KEY))?.[ACTION_ID]?.reportActionID).toBe(ACTION_ID);
    });
});
