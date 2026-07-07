import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';

import {clearAgentAvatarUpdateError, clearAgentUpdateError, createAgent, deleteAgent, updateAgentAvatar, updateAgentName, updateAgentPrompt} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));

const mockWrite = jest.mocked(write);
const mockGoBack = jest.mocked(Navigation.goBack);

function getWriteOptions(): {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockWrite.mock.calls.at(0)?.at(2);
    if (!options || typeof options !== 'object' || !('optimisticData' in options)) {
        throw new Error('write was not called with optimistic options');
    }
    return options as {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]};
}

function getOptimisticAccountID(optimisticData: AnyOnyxUpdate[]): number {
    const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
    if (!personalDetailUpdate?.value || typeof personalDetailUpdate.value !== 'object') {
        throw new Error('No personal detail update in optimisticData');
    }
    return Number(Object.keys(personalDetailUpdate.value as Record<string, unknown>).at(0));
}

describe('createAgent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with CREATE_AGENT command and provided params', () => {
        createAgent('My Agent', 'Reject gambling expenses.');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, expect.objectContaining({firstName: 'My Agent', prompt: 'Reject gambling expenses.'}), expect.any(Object));
    });

    it('passes undefined firstName through unchanged', () => {
        createAgent(undefined, 'Some prompt');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, expect.objectContaining({firstName: undefined, prompt: 'Some prompt'}), expect.any(Object));
    });

    it('optimistic personal detail entry has a positive account ID from generateReportID', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        expect(Number(accountID)).toBeGreaterThan(0);
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

    it('passes customExpensifyAvatarID to write params when provided', () => {
        createAgent('Bot', 'My prompt', 'bot-avatar--blue');

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.CREATE_AGENT,
            expect.objectContaining({firstName: 'Bot', prompt: 'My prompt', customExpensifyAvatarID: 'bot-avatar--blue'}),
            expect.any(Object),
        );
    });

    it('passes file to write params when provided', () => {
        const mockFile = createMock<File>({uri: 'file://photo.jpg', name: 'photo.jpg'});
        createAgent('Bot', 'My prompt', undefined, mockFile, 'file://photo.jpg');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, expect.objectContaining({firstName: 'Bot', prompt: 'My prompt', file: mockFile}), expect.any(Object));
    });

    it('uploads file in the CREATE_AGENT call itself — no separate UPDATE_AGENT_AVATAR write', () => {
        const mockFile = createMock<File>({uri: 'file://photo.jpg', name: 'photo.jpg'});
        createAgent('Bot', 'My prompt', undefined, mockFile, 'file://photo.jpg');

        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWrite).not.toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_AGENT_AVATAR, expect.anything(), expect.anything());
    });

    it('includes resolved avatar URI in optimistic and failure personal detail data for a preset ID', () => {
        createAgent('Bot', 'My prompt', 'bot-avatar--blue');

        const {optimisticData, failureData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const optimisticEntry = (optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST)?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;
        expect(optimisticEntry.avatar).toBeTruthy();
        expect(optimisticEntry.avatarThumbnail).toBeTruthy();

        const failureEntry = (failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST)?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;
        expect(failureEntry.avatar).toBeTruthy();
        expect(failureEntry.avatarThumbnail).toBeTruthy();
    });

    it('includes optimisticAvatarURI in optimistic and failure personal detail data for a custom file URI', () => {
        const fileURI = 'file://local-photo.jpg';
        createAgent('Bot', 'My prompt', undefined, undefined, fileURI);

        const {optimisticData, failureData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const optimisticEntry = (optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST)?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;
        expect(optimisticEntry.avatar).toBe(fileURI);
        expect(optimisticEntry.avatarThumbnail).toBe(fileURI);

        const failureEntry = (failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST)?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;
        expect(failureEntry.avatar).toBe(fileURI);
        expect(failureEntry.avatarThumbnail).toBe(fileURI);
    });

    it('does not include avatar fields in optimistic data when no avatar args are given', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const entry = (optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST)?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;
        expect(entry.avatar).toBeUndefined();
        expect(entry.avatarThumbnail).toBeUndefined();
    });

    it('forwards policyID in the write params when provided', () => {
        createAgent('Bot', 'My prompt', undefined, undefined, undefined, 'POLICY_42');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, expect.objectContaining({firstName: 'Bot', prompt: 'My prompt', policyID: 'POLICY_42'}), expect.any(Object));
    });

    it('returns the optimistic accountID and avatarURI so callers can chain follow-up navigation', () => {
        const result = createAgent('Bot', 'My prompt', 'bot-avatar--blue');

        expect(result.optimisticAccountID).toEqual(expect.any(Number));
        expect(result.optimisticAccountID).toBeGreaterThan(0);
        expect(result.avatarURI).toBeTruthy();
    });

    it('does not touch the policy when no policyID is provided', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData, successData, failureData} = getWriteOptions();
        const allKeys: string[] = [...optimisticData, ...successData, ...failureData].map((u) => String(u.key));

        expect(allKeys.some((k) => k.startsWith(ONYXKEYS.COLLECTION.POLICY))).toBe(false);
    });

    it('omits login on the optimistic personal detail entry — the real email is server-assigned', () => {
        createAgent('Bot', 'My prompt', undefined, undefined, undefined, 'POLICY_42');

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const accountID = getOptimisticAccountID(optimisticData);
        const entry = (personalDetailUpdate?.value as Record<string, unknown>)?.[accountID] as Record<string, unknown>;

        expect(entry.login).toBeUndefined();
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

    it('passes the optimistic accountID through to the server so it can echo a real-ID mapping', () => {
        const result = createAgent('Bot', 'My prompt');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, expect.objectContaining({optimisticAccountID: String(result.optimisticAccountID)}), expect.any(Object));
    });

    it('failure data preserves optimistic personal detail and merges errors onto the prompt entry', () => {
        createAgent('Bot', 'My prompt');

        const {optimisticData, failureData} = getWriteOptions();
        const accountID = getOptimisticAccountID(optimisticData);

        const personalDetailRollback = failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const promptRollback = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);

        expect((personalDetailRollback?.value as Record<string, unknown>)[accountID]).toMatchObject({
            accountID,
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

    it('resolves createdAgentAccountID with the real server agent, ignoring other pending optimistic agents', async () => {
        await Onyx.clear();

        const {optimisticAccountID, createdAgentAccountID} = createAgent('Bot', 'My prompt');

        // Let waitForCreatedAgentAccountID establish its baseline from the (empty) collection.
        await waitForBatchedUpdates();

        let resolvedAccountID: number | undefined;
        void createdAgentAccountID.then((id) => {
            resolvedAccountID = id;
        });

        // A second agent the user creates before this one's CREATE_AGENT responds shows up as a *new*
        // optimistic prompt entry (pendingAction ADD). It must NOT be mistaken for the created agent.
        const otherOptimisticAccountID = optimisticAccountID + 1;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${otherOptimisticAccountID}`, {
            prompt: 'Another prompt',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        });
        await waitForBatchedUpdates();

        // Still unresolved — the only new entry is another optimistic placeholder.
        expect(resolvedAccountID).toBeUndefined();

        // The real, server-created agent arrives without an ADD pending action.
        const realAccountID = 22542959;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, {prompt: 'My prompt'});
        await waitForBatchedUpdates();

        await expect(createdAgentAccountID).resolves.toBe(realAccountID);
        expect(resolvedAccountID).toBe(realAccountID);
    });
});

const TEST_ACCOUNT_ID = 42;

describe('updateAgentName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with UPDATE_AGENT_NAME command and correct params', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_AGENT_NAME, {agentAccountID: TEST_ACCOUNT_ID, firstName: 'New Name'}, expect.any(Object));
    });

    it('optimistic data updates displayName in PERSONAL_DETAILS_LIST for the given accountID', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);

        expect((personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID]).toMatchObject({displayName: 'New Name'});
    });

    it('optimistic data sets pendingAction UPDATE and errors null on the prompt key', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {optimisticData} = getWriteOptions();
        const promptUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.value).toMatchObject({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null});
    });

    it('success data sets pendingAction null on the prompt key', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {successData} = getWriteOptions();
        const promptUpdate = successData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect((promptUpdate?.value as Record<string, unknown>).pendingAction).toBeNull();
    });

    it('failure data reverts displayName to originalFirstName in PERSONAL_DETAILS_LIST', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {failureData} = getWriteOptions();
        const personalDetailUpdate = failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);

        expect((personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID]).toMatchObject({displayName: 'Old Name'});
    });

    it('failure data sets nameErrors (truthy) and pendingAction null on the prompt key', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {failureData} = getWriteOptions();
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);
        const promptValue = promptUpdate?.value as Record<string, unknown> | undefined;

        expect(promptValue?.nameErrors).toBeTruthy();
        expect(promptValue?.pendingAction).toBeNull();
    });

    it('no data set touches EDIT_AGENT_NAME_FORM', () => {
        updateAgentName(TEST_ACCOUNT_ID, 'New Name', 'Old Name');

        const {optimisticData, successData, failureData} = getWriteOptions();

        expect(optimisticData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM)).toBe(false);
        expect(successData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM)).toBe(false);
        expect(failureData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM)).toBe(false);
    });
});

describe('updateAgentPrompt', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with UPDATE_AGENT_PROMPT command and correct params', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_AGENT_PROMPT, {agentAccountID: TEST_ACCOUNT_ID, prompt: 'New prompt'}, expect.any(Object));
    });

    it('optimistic data sets prompt, pendingAction UPDATE, and errors null on the prompt key', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        const {optimisticData} = getWriteOptions();
        const promptUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.value).toMatchObject({prompt: 'New prompt', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null});
    });

    it('success data sets pendingAction null on the prompt key', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        const {successData} = getWriteOptions();
        const promptUpdate = successData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect((promptUpdate?.value as Record<string, unknown>).pendingAction).toBeNull();
    });

    it('failure data reverts prompt to originalPrompt on the prompt key', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        const {failureData} = getWriteOptions();
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect((promptUpdate?.value as Record<string, unknown>).prompt).toBe('Old prompt');
    });

    it('failure data sets promptErrors (truthy) and pendingAction null on the prompt key', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        const {failureData} = getWriteOptions();
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);
        const promptValue = promptUpdate?.value as Record<string, unknown> | undefined;

        expect(promptValue?.promptErrors).toBeTruthy();
        expect(promptValue?.pendingAction).toBeNull();
    });

    it('no data set touches EDIT_AGENT_PROMPT_FORM', () => {
        updateAgentPrompt(TEST_ACCOUNT_ID, 'New prompt', 'Old prompt');

        const {optimisticData, successData, failureData} = getWriteOptions();

        expect(optimisticData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM)).toBe(false);
        expect(successData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM)).toBe(false);
        expect(failureData.some((u) => u.key === ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM)).toBe(false);
    });
});

describe('deleteAgent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with DELETE_AGENT command and correct params', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_AGENT, {agentAccountID: TEST_ACCOUNT_ID}, expect.any(Object));
    });

    it('optimistic data merges pendingAction DELETE on the prompt key', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        const {optimisticData} = getWriteOptions();
        const promptUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.onyxMethod).toBe('merge');
        expect(promptUpdate?.value).toMatchObject({pendingAction: 'delete'});
    });

    it('success data sets the prompt key to null', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        const {successData} = getWriteOptions();
        const promptUpdate = successData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.onyxMethod).toBe('set');
        expect(promptUpdate?.value).toBeNull();
    });

    it('success data nulls the personal detail entry', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        const {successData} = getWriteOptions();
        const personalDetailUpdate = successData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);

        expect((personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID]).toBeNull();
    });

    it('failure data merges pendingAction DELETE and errors on the prompt key', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        const {failureData} = getWriteOptions();
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.onyxMethod).toBe('merge');
        expect(promptUpdate?.value).toMatchObject({pendingAction: 'delete'});
        expect((promptUpdate?.value as Record<string, unknown>)?.errors).toBeTruthy();
    });

    it('calls Navigation.goBack after issuing the write', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    describe('cascade to policies containing the agent', () => {
        const AGENT_EMAIL = 'agent@expensifail.com';
        const OTHER_EMAIL = 'submitter@expensifail.com';
        const OWNER_EMAIL = 'owner@expensifail.com';
        const POLICY_ID = 'POLICY1';
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`;

        const buildPolicies = (): OnyxCollection<Policy> => ({
            [policyKey]: {
                ...createRandomPolicy(1),
                id: POLICY_ID,
                owner: OWNER_EMAIL,
                approver: OWNER_EMAIL,
                employeeList: {
                    [AGENT_EMAIL]: {email: AGENT_EMAIL, submitsTo: AGENT_EMAIL, forwardsTo: OWNER_EMAIL},
                    [OTHER_EMAIL]: {email: OTHER_EMAIL, submitsTo: AGENT_EMAIL},
                },
            },
        });

        it('marks agent employeeList entry as pending DELETE optimistically', () => {
            deleteAgent(TEST_ACCOUNT_ID, AGENT_EMAIL, buildPolicies());

            const {optimisticData} = getWriteOptions();
            const policyUpdate = optimisticData.find((u) => u.key === policyKey);
            const employees = (policyUpdate?.value as {employeeList: Record<string, {pendingAction: string}>})?.employeeList;
            expect(employees?.[AGENT_EMAIL]).toEqual({pendingAction: 'delete'});
        });

        it('leaves other employees and approver chains untouched so the workflow card still renders', () => {
            deleteAgent(TEST_ACCOUNT_ID, AGENT_EMAIL, buildPolicies());

            const {optimisticData} = getWriteOptions();
            const policyUpdate = optimisticData.find((u) => u.key === policyKey);
            const value = policyUpdate?.value as {employeeList: Record<string, unknown>; approver?: string; rules?: unknown};
            expect(value?.employeeList[OTHER_EMAIL]).toBeUndefined();
            expect(value?.approver).toBeUndefined();
            expect(value?.rules).toBeUndefined();
        });

        it('nulls the agent employeeList entry on success', () => {
            deleteAgent(TEST_ACCOUNT_ID, AGENT_EMAIL, buildPolicies());

            const {successData} = getWriteOptions();
            const policyUpdate = successData.find((u) => u.key === policyKey);
            const employees = (policyUpdate?.value as {employeeList: Record<string, unknown>})?.employeeList;
            expect(employees?.[AGENT_EMAIL]).toBeNull();
        });

        it('restores agent pendingAction with errors on failure', () => {
            deleteAgent(TEST_ACCOUNT_ID, AGENT_EMAIL, buildPolicies());

            const {failureData} = getWriteOptions();
            const policyUpdate = failureData.find((u) => u.key === policyKey);
            const agentEntry = (policyUpdate?.value as {employeeList: Record<string, {pendingAction?: string; errors?: unknown}>})?.employeeList[AGENT_EMAIL];
            expect(agentEntry?.pendingAction).toBe('delete');
            expect(agentEntry?.errors).toBeTruthy();
        });

        it('skips policies that do not contain the agent', () => {
            const policies: OnyxCollection<Policy> = {
                [policyKey]: {
                    ...createRandomPolicy(1),
                    id: POLICY_ID,
                    owner: OWNER_EMAIL,
                    approver: OWNER_EMAIL,
                    employeeList: {[OWNER_EMAIL]: {email: OWNER_EMAIL}},
                },
            };
            deleteAgent(TEST_ACCOUNT_ID, AGENT_EMAIL, policies);

            const {optimisticData} = getWriteOptions();
            expect(optimisticData.find((u) => u.key === policyKey)).toBeUndefined();
        });
    });
});

describe('clearAgentUpdateError', () => {
    let mergeSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mergeSpy = jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
    });

    afterEach(() => {
        mergeSpy.mockRestore();
    });

    it('calls Onyx.merge on the correct prompt key with errors null', () => {
        clearAgentUpdateError(TEST_ACCOUNT_ID);

        expect(mergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`, {avatarErrors: null, errors: null, nameErrors: null, promptErrors: null});
    });
});

describe('updateAgentAvatar (file upload)', () => {
    const mockFile = createMock<File>({uri: 'file://photo.jpg', name: 'photo.jpg'});
    const currentAvatar = 'https://cdn.example.com/old.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with UPDATE_AGENT_AVATAR command and file param', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {file: mockFile, uri: 'file://photo.jpg'}, currentAvatar);

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_AGENT_AVATAR, {agentAccountID: TEST_ACCOUNT_ID, file: mockFile}, expect.any(Object));
    });

    it('optimistic data sets avatar URI, pendingFields UPDATE, and clears errorFields', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {file: mockFile, uri: 'file://photo.jpg'}, currentAvatar);

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const value = (personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID] as Record<string, unknown>;

        expect(value.avatar).toBe('file://photo.jpg');
        expect(value.avatarThumbnail).toBe('file://photo.jpg');
        expect((value.pendingFields as Record<string, unknown>).avatar).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        expect((value.errorFields as Record<string, unknown>).avatar).toBeNull();
    });

    it('optimistic data clears errors and avatarErrors on the prompt key', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {file: mockFile, uri: 'file://photo.jpg'}, currentAvatar);

        const {optimisticData} = getWriteOptions();
        const promptUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(promptUpdate?.value).toMatchObject({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null, avatarErrors: null});
    });

    it('success data clears pendingFields and errorFields', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {file: mockFile, uri: 'file://photo.jpg'}, currentAvatar);

        const {successData} = getWriteOptions();
        const personalDetailUpdate = successData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const value = (personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID] as Record<string, unknown>;

        expect((value.pendingFields as Record<string, unknown>).avatar).toBeNull();
        expect((value.errorFields as Record<string, unknown>).avatar).toBeNull();
    });

    it('failure data reverts avatar to currentAvatar and sets avatarErrors', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {file: mockFile, uri: 'file://photo.jpg'}, currentAvatar);

        const {failureData} = getWriteOptions();
        const personalDetailUpdate = failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const value = (personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID] as Record<string, unknown>;
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(value.avatar).toBe(currentAvatar);
        expect(value.avatarThumbnail).toBe(currentAvatar);
        expect((promptUpdate?.value as Record<string, unknown>).avatarErrors).toBeTruthy();
        expect((promptUpdate?.value as Record<string, unknown>).pendingAction).toBeNull();
    });
});

describe('updateAgentAvatar (bot avatar)', () => {
    const BOT_AVATAR_ID = 'bot_avatar_1';
    const BOT_AVATAR_URI = 'https://cdn.example.com/bot_avatar_1.png';
    const currentAvatar = 'https://cdn.example.com/old.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls write with UPDATE_AGENT_AVATAR command and customExpensifyAvatarID param', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {customExpensifyAvatarID: BOT_AVATAR_ID, uri: BOT_AVATAR_URI}, currentAvatar);

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_AGENT_AVATAR, {agentAccountID: TEST_ACCOUNT_ID, customExpensifyAvatarID: BOT_AVATAR_ID}, expect.any(Object));
    });

    it('optimistic data sets avatar URI for bot avatar', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {customExpensifyAvatarID: BOT_AVATAR_ID, uri: BOT_AVATAR_URI}, currentAvatar);

        const {optimisticData} = getWriteOptions();
        const personalDetailUpdate = optimisticData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const value = (personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID] as Record<string, unknown>;

        expect(value.avatar).toBe(BOT_AVATAR_URI);
        expect(value.avatarThumbnail).toBe(BOT_AVATAR_URI);
        expect((value.pendingFields as Record<string, unknown>).avatar).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    });

    it('failure data reverts avatar and sets avatarErrors', () => {
        updateAgentAvatar(TEST_ACCOUNT_ID, {customExpensifyAvatarID: BOT_AVATAR_ID, uri: BOT_AVATAR_URI}, currentAvatar);

        const {failureData} = getWriteOptions();
        const personalDetailUpdate = failureData.find((u) => u.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
        const value = (personalDetailUpdate?.value as Record<string, unknown>)[TEST_ACCOUNT_ID] as Record<string, unknown>;
        const promptUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`);

        expect(value.avatar).toBe(currentAvatar);
        expect((promptUpdate?.value as Record<string, unknown>).avatarErrors).toBeTruthy();
    });
});

describe('clearAgentAvatarUpdateError', () => {
    let mergeSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mergeSpy = jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
    });

    afterEach(() => {
        mergeSpy.mockRestore();
    });

    it('calls Onyx.merge on the correct prompt key with avatarErrors null', () => {
        clearAgentAvatarUpdateError(TEST_ACCOUNT_ID);

        expect(mergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`, {avatarErrors: null});
    });
});
