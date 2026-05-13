import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {createAgent} from '@userActions/Agent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

function getWriteOptions(): {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockWrite.mock.calls.at(0)?.at(2);
    if (!options || typeof options !== 'object' || !('optimisticData' in options)) {
        throw new Error('write was not called with optimistic options');
    }
    return options as {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]};
}

function getOptimisticAccountID(optimisticData: AnyOnyxUpdate[]): string {
    const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
    if (!personalDetailUpdate?.value || typeof personalDetailUpdate.value !== 'object') {
        throw new Error('No personal detail update in optimisticData');
    }
    return Object.keys(personalDetailUpdate.value as Record<string, unknown>).at(0) ?? '';
}

describe('createAgent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with CREATE_AGENT command and provided params', () => {
        createAgent('My Agent', 'Reject gambling expenses.');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, {firstName: 'My Agent', prompt: 'Reject gambling expenses.'}, expect.any(Object));
    });

    it('passes undefined firstName through unchanged', () => {
        createAgent(undefined, 'Some prompt');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, {firstName: undefined, prompt: 'Some prompt'}, expect.any(Object));
    });

    it('optimistic personal detail entry has a negative account ID', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        expect(Number(accountID)).toBeLessThan(0);
    });

    it('optimistic personal detail entry stores displayName and marks entry as optimistic', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const accountID = getOptimisticAccountID(optimisticData);

        expect((personalDetailUpdate?.value as Record<string, unknown>)[accountID]).toMatchObject({
            displayName: 'Bot',
            isOptimisticPersonalDetail: true,
        });
    });

    it('optimistic personal detail entry stores undefined displayName when firstName is undefined', () => {
        createAgent(undefined, 'My prompt');

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const accountID = getOptimisticAccountID(optimisticData);

        expect((personalDetailUpdate?.value as Record<string, unknown>)[accountID]).toMatchObject({
            displayName: undefined,
            isOptimisticPersonalDetail: true,
        });
    });

    it('optimistic prompt entry uses the same account ID as the personal detail entry', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);
        const promptUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);

        expect(promptUpdate?.value).toEqual({
            prompt: 'My prompt',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        });
    });

    it('does not merge ADD_AGENT_FORM (navigation handles UX after submit)', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData, successData, failureData} = getWriteOptions();

        expect(optimisticData.some((u) => u.key === ONYXKEYS.FORMS.ADD_AGENT_FORM)).toBe(false);
        expect(successData.some((u) => u.key === ONYXKEYS.FORMS.ADD_AGENT_FORM)).toBe(false);
        expect(failureData.some((u) => u.key === ONYXKEYS.FORMS.ADD_AGENT_FORM)).toBe(false);
    });

    it('success data nulls out both optimistic entries', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData, successData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const personalDetailRollback = successData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const promptRollback = successData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);

        expect((personalDetailRollback?.value as Record<string, unknown>)[accountID]).toBeNull();
        expect(promptRollback?.value).toBeNull();
    });

    it('failure data preserves optimistic personal detail and merges errors onto the prompt entry', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData, failureData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const personalDetailRollback = failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const promptRollback = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);

        expect((personalDetailRollback?.value as Record<string, unknown>)[accountID]).toMatchObject({
            accountID: Number(accountID),
            displayName: 'Bot',
            isOptimisticPersonalDetail: true,
        });
        const promptValue = promptRollback?.value as Record<string, unknown> | undefined;

        expect(promptValue).toMatchObject({
            prompt: 'My prompt',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        });
        expect(promptValue?.errors).toBeTruthy();
    });
});
