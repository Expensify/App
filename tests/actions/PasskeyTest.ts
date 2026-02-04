import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import Onyx from 'react-native-onyx';
import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@libs/actions/Passkey';
import type {BackendCredential} from '@libs/actions/Passkey';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocalPasskeyEntry, PasskeyCredential} from '@src/types/onyx';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('actions/Passkey', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('getPasskeyOnyxKey', () => {
        it('should return correct key format', () => {
            const key = getPasskeyOnyxKey('123', 'expensify.com');

            expect(key).toBe(`${ONYXKEYS.COLLECTION.PASSKEYS}123@expensify.com`);
        });
    });

    describe('addLocalPasskeyCredential', () => {
        const userId = '123';
        const rpId = 'expensify.com';
        const credential: PasskeyCredential = {id: 'cred-1', type: 'public-key', transports: ['internal']};

        it('should create new entry when existingEntry is null', async () => {
            addLocalPasskeyCredential({userId, rpId, credential, existingEntry: null});
            await waitForBatchedUpdates();

            const value = await getOnyxValue(getPasskeyOnyxKey(userId, rpId));
            expect(value).toEqual({credentialIds: [credential]});
        });

        it('should add credential to existing entry', async () => {
            const existingEntry: LocalPasskeyEntry = {credentialIds: [{id: 'existing', type: 'public-key', transports: ['internal']}]};

            addLocalPasskeyCredential({userId, rpId, credential, existingEntry});
            await waitForBatchedUpdates();

            const value = await getOnyxValue(getPasskeyOnyxKey(userId, rpId));
            expect(value).toEqual({credentialIds: [{id: 'existing', type: 'public-key', transports: ['internal']}, credential]});
        });

        it('should update existing credential when id matches', async () => {
            const existingEntry: LocalPasskeyEntry = {credentialIds: [{id: 'cred-1', type: 'public-key', transports: ['internal']}]};
            const updatedCredential: PasskeyCredential = {id: 'cred-1', type: 'public-key', transports: ['internal', 'hybrid']};

            addLocalPasskeyCredential({userId, rpId, credential: updatedCredential, existingEntry});
            await waitForBatchedUpdates();

            const value = await getOnyxValue(getPasskeyOnyxKey(userId, rpId));
            expect(value).toEqual({credentialIds: [updatedCredential]});
        });
    });

    describe('deleteLocalPasskeyCredentials', () => {
        const userId = '123';
        const rpId = 'expensify.com';

        it('should delete existing passkey entry from Onyx', async () => {
            const entry: LocalPasskeyEntry = {credentialIds: [{id: 'cred-1', type: 'public-key', transports: ['internal']}]};
            await Onyx.set(`${ONYXKEYS.COLLECTION.PASSKEYS}${userId}@${rpId}`, entry);
            await waitForBatchedUpdates();

            deleteLocalPasskeyCredentials(userId, rpId);
            await waitForBatchedUpdates();

            const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.PASSKEYS}${userId}@${rpId}`);
            expect(value).toBeUndefined();
        });

        it('should handle deletion of non-existent entry gracefully', async () => {
            deleteLocalPasskeyCredentials(userId, rpId);
            await waitForBatchedUpdates();

            const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.PASSKEYS}${userId}@${rpId}`);
            expect(value).toBeUndefined();
        });
    });

    describe('reconcileLocalPasskeysWithBackend', () => {
        const userId = '123';
        const rpId = 'expensify.com';

        it('should return empty array when localEntry is null', () => {
            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials: [], localEntry: null});

            expect(result).toEqual([]);
        });

        it('should return empty array when localEntry has no credentials', () => {
            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials: [], localEntry: {credentialIds: []}});

            expect(result).toEqual([]);
        });

        it('should return all matched credentials when all exist on backend', () => {
            const localCredentials: PasskeyCredential[] = [
                {id: 'cred-1', type: 'public-key', transports: ['internal']},
                {id: 'cred-2', type: 'public-key', transports: ['hybrid']},
            ];
            const allowCredentials: BackendCredential[] = [
                {id: 'cred-1', type: 'public-key'},
                {id: 'cred-2', type: 'public-key'},
            ];

            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials, localEntry: {credentialIds: localCredentials}});

            expect(result).toEqual(localCredentials);
        });

        it('should remove local credentials not on backend and update Onyx', async () => {
            const localCredentials: PasskeyCredential[] = [
                {id: 'cred-1', type: 'public-key', transports: ['internal']},
                {id: 'cred-2', type: 'public-key', transports: ['hybrid']},
            ];
            const allowCredentials: BackendCredential[] = [{id: 'cred-1', type: 'public-key'}];

            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials, localEntry: {credentialIds: localCredentials}});
            await waitForBatchedUpdates();

            expect(result).toEqual([{id: 'cred-1', type: 'public-key', transports: ['internal']}]);

            const value = await getOnyxValue(getPasskeyOnyxKey(userId, rpId));
            expect(value).toEqual({credentialIds: [{id: 'cred-1', type: 'public-key', transports: ['internal']}]});
        });

        it('should delete entire entry when no credentials match backend', async () => {
            const localCredentials: PasskeyCredential[] = [{id: 'old-cred', type: 'public-key', transports: ['internal']}];
            const allowCredentials: BackendCredential[] = [{id: 'new-cred', type: 'public-key'}];

            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials, localEntry: {credentialIds: localCredentials}});
            await waitForBatchedUpdates();

            expect(result).toEqual([]);

            const value = await getOnyxValue(getPasskeyOnyxKey(userId, rpId));
            expect(value).toBeUndefined();
        });

        it('should preserve transports from local credentials', () => {
            // Backend doesn't store transports, only local storage does
            const localCredentials: PasskeyCredential[] = [{id: 'cred-1', type: 'public-key', transports: ['internal', 'hybrid']}];
            const allowCredentials: BackendCredential[] = [{id: 'cred-1', type: 'public-key'}];

            const result = reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials, localEntry: {credentialIds: localCredentials}});

            expect(result).toEqual([{id: 'cred-1', type: 'public-key', transports: ['internal', 'hybrid']}]);
        });
    });
});
