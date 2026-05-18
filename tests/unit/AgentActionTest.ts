import Onyx from 'react-native-onyx';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import {clearAgentAvatarUpdateError, clearAgentUpdateError, createAgent, deleteAgent, updateAgentAvatar, updateAgentName, updateAgentPrompt} from '@userActions/Agent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

const mockWrite = jest.mocked(write);
const mockNavigate = jest.mocked(Navigation.navigate);

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

    it('passes customExpensifyAvatarID to write params when provided', () => {
        createAgent('Bot', 'My prompt', 'bot-avatar--blue');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, {firstName: 'Bot', prompt: 'My prompt', customExpensifyAvatarID: 'bot-avatar--blue'}, expect.any(Object));
    });

    it('passes file to write params when provided', () => {
        const mockFile = {uri: 'file://photo.jpg', name: 'photo.jpg'} as unknown as File;
        createAgent('Bot', 'My prompt', undefined, mockFile, 'file://photo.jpg');

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_AGENT, {firstName: 'Bot', prompt: 'My prompt', file: mockFile}, expect.any(Object));
    });

    it('uploads file in the CREATE_AGENT call itself — no separate UPDATE_AGENT_AVATAR write', () => {
        const mockFile = {uri: 'file://photo.jpg', name: 'photo.jpg'} as unknown as File;
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

    it('calls Navigation.navigate after issuing the write', () => {
        deleteAgent(TEST_ACCOUNT_ID);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
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
    const mockFile = {uri: 'file://photo.jpg', name: 'photo.jpg'} as unknown as File;
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
