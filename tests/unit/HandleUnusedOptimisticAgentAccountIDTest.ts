import handleUnusedOptimisticAgentAccountID from '@libs/Middleware/HandleUnusedOptimisticAgentAccountID';

import {clear, getAll, getOngoingRequest, processNextRequest, save} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import cloneDeep from 'lodash/cloneDeep';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type MappingKey = typeof ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING;

// Optimistic agent accountIDs are generated with generateReportID(), so they are long random digit sequences.
// Long distinct literals keep the middleware's substring replacement honest: no ID is a substring of another.
const optimisticAccountID = 4864093870251437;
const realAccountID = 7093215648820996;
const otherAgentAccountID = 1592647380425183;

let requestIndex = 0;

function buildUpdateAgentPromptRequest(agentAccountID: number): AnyRequest {
    requestIndex += 1;
    return {
        command: 'UpdateAgentPrompt',
        data: {agentAccountID, prompt: 'Book my flights', apiRequestType: 'write'},
        requestIndex,
    };
}

function buildMappingResponse(mapping: Record<string, number | null>): Response<MappingKey> {
    return {
        jsonCode: 200,
        onyxData: [{onyxMethod: 'merge', key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, value: mapping}],
    };
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(async () => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    // PersistedRequests.save() only lands in getAll() once the module's Onyx connect callback has initialized it.
    await waitForBatchedUpdates();
    clear();
    await waitForBatchedUpdates();
});

afterEach(() => {
    clear();
    Onyx.clear();
});

describe('HandleUnusedOptimisticAgentAccountID middleware', () => {
    it('rewrites the numeric agentAccountID of persisted agent update requests to the real accountID', async () => {
        const request = buildUpdateAgentPromptRequest(optimisticAccountID);
        save(request);
        await waitForBatchedUpdates();

        const response = buildMappingResponse({[optimisticAccountID]: realAccountID});
        const resolvedResponse = await handleUnusedOptimisticAgentAccountID(Promise.resolve(response), buildUpdateAgentPromptRequest(optimisticAccountID), false);

        expect(resolvedResponse).toBe(response);
        const persistedData = getAll().at(0)?.data;
        expect(persistedData?.agentAccountID).toBe(realAccountID);
        expect(persistedData?.prompt).toBe('Book my flights');
        expect(getAll().at(0)?.command).toBe('UpdateAgentPrompt');
    });

    it('rewrites the optimistic accountID inside string values and object keys of persisted request data', async () => {
        requestIndex += 1;
        const request: AnyRequest = {
            command: 'CreateAgent',
            data: {
                firstName: 'Concierge',
                optimisticAccountID: String(optimisticAccountID),
                agentPromptKey: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`,
                nvpUpdates: {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`]: {prompt: 'Book my flights'},
                },
            },
            requestIndex,
        };
        save(request);
        await waitForBatchedUpdates();

        await handleUnusedOptimisticAgentAccountID(Promise.resolve(buildMappingResponse({[optimisticAccountID]: realAccountID})), request, false);

        const persistedData = getAll().at(0)?.data;
        expect(persistedData?.optimisticAccountID).toBe(String(realAccountID));
        expect(persistedData?.agentPromptKey).toBe(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(persistedData?.nvpUpdates).toStrictEqual({
            [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`]: {prompt: 'Book my flights'},
        });
        expect(persistedData?.firstName).toBe('Concierge');
    });

    it('rewrites the Onyx keys inside persisted successData and failureData while leaving unrelated updates untouched', async () => {
        requestIndex += 1;
        const request: AnyRequest = {
            command: 'UpdateAgentPrompt',
            data: {agentAccountID: optimisticAccountID, prompt: 'Book my flights', apiRequestType: 'write'},
            successData: [
                {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, value: {pendingAction: null, promptErrors: null}},
                {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${otherAgentAccountID}`, value: {pendingAction: null}},
            ],
            failureData: [
                {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, value: {prompt: 'Old prompt', pendingAction: null}},
                {onyxMethod: 'merge', key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: {[optimisticAccountID]: {displayName: 'Concierge'}}},
            ],
            requestIndex,
        };
        save(request);
        await waitForBatchedUpdates();

        await handleUnusedOptimisticAgentAccountID(Promise.resolve(buildMappingResponse({[optimisticAccountID]: realAccountID})), request, false);

        const persistedRequest = getAll().at(0);
        expect(persistedRequest?.data?.agentAccountID).toBe(realAccountID);
        expect(persistedRequest?.successData).toStrictEqual([
            {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, value: {pendingAction: null, promptErrors: null}},
            {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${otherAgentAccountID}`, value: {pendingAction: null}},
        ]);
        expect(persistedRequest?.failureData).toStrictEqual([
            {onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, value: {prompt: 'Old prompt', pendingAction: null}},
            {onyxMethod: 'merge', key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: {[realAccountID]: {displayName: 'Concierge'}}},
        ]);
    });

    it('rewrites the ongoing request when the response is processed from the sequential queue', async () => {
        save(buildUpdateAgentPromptRequest(optimisticAccountID));
        await waitForBatchedUpdates();
        const ongoingRequest = processNextRequest();
        expect(ongoingRequest).not.toBeNull();

        if (!ongoingRequest) {
            return;
        }
        await handleUnusedOptimisticAgentAccountID(Promise.resolve(buildMappingResponse({[optimisticAccountID]: realAccountID})), ongoingRequest, true);

        const ongoingData = getOngoingRequest()?.data;
        expect(ongoingData?.agentAccountID).toBe(realAccountID);
        expect(ongoingData?.prompt).toBe('Book my flights');
    });

    it('leaves persisted requests untouched when the response carries no accountID mapping', async () => {
        save(buildUpdateAgentPromptRequest(optimisticAccountID));
        await waitForBatchedUpdates();
        const requestsBefore = cloneDeep(getAll());

        const responseWithOtherKey: Response<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> = {
            jsonCode: 200,
            onyxData: [{onyxMethod: 'merge', key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: {[realAccountID]: {firstName: 'Concierge'}}}],
        };
        await handleUnusedOptimisticAgentAccountID(Promise.resolve(responseWithOtherKey), buildUpdateAgentPromptRequest(optimisticAccountID), false);
        await handleUnusedOptimisticAgentAccountID(Promise.resolve({jsonCode: 200}), buildUpdateAgentPromptRequest(optimisticAccountID), false);

        expect(getAll()).toStrictEqual(requestsBefore);
    });

    it('skips mapping entries that have already been consumed and cleared', async () => {
        save(buildUpdateAgentPromptRequest(optimisticAccountID));
        await waitForBatchedUpdates();
        const requestsBefore = cloneDeep(getAll());

        await handleUnusedOptimisticAgentAccountID(Promise.resolve(buildMappingResponse({[optimisticAccountID]: null})), buildUpdateAgentPromptRequest(optimisticAccountID), false);

        expect(getAll()).toStrictEqual(requestsBefore);
    });

    it('does not touch requests that reference a different agent accountID', async () => {
        save(buildUpdateAgentPromptRequest(optimisticAccountID));
        const otherAgentRequest = buildUpdateAgentPromptRequest(otherAgentAccountID);
        save(otherAgentRequest);
        await waitForBatchedUpdates();
        const otherAgentRequestBefore = cloneDeep(otherAgentRequest);

        await handleUnusedOptimisticAgentAccountID(Promise.resolve(buildMappingResponse({[optimisticAccountID]: realAccountID})), buildUpdateAgentPromptRequest(optimisticAccountID), false);

        expect(getAll().at(0)?.data?.agentAccountID).toBe(realAccountID);
        expect(getAll().at(1)).toStrictEqual(otherAgentRequestBefore);
    });
});
