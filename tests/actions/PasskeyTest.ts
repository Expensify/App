import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import Onyx from 'react-native-onyx';
import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@libs/actions/Passkey';
import type {BackendPasskeyCredential} from '@libs/actions/Passkey';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocalPasskeyCredentialsEntry, PasskeyCredential} from '@src/types/onyx';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('actions/Passkey', () => {
    const userId = '123';

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('getPasskeyOnyxKey', () => {
        it('should return correct key format', () => {
            // Given a userId
            // When generating an Onyx key
            const key = getPasskeyOnyxKey(userId);

            // Then it should return the PASSKEY_CREDENTIALS collection prefix followed by the userId
            expect(key).toBe(`${ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${userId}`);
        });
    });

    describe('addLocalPasskeyCredential', () => {
        const credential: PasskeyCredential = {id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]};

        it('should throw error when userId is empty', () => {
            // Given an empty userId
            // When adding a credential
            // Then it should throw an error
            expect(() => addLocalPasskeyCredential({userId: '', credential, existingCredentials: null})).toThrow();
        });

        it('should create new entry when existingEntry is null', async () => {
            // Given no existing passkey entry in Onyx
            // When adding a new credential
            addLocalPasskeyCredential({userId, credential, existingCredentials: null});
            await waitForBatchedUpdates();

            // Then the credential should be stored as the only entry in Onyx
            const value = await getOnyxValue(getPasskeyOnyxKey(userId));
            expect(value).toEqual([credential]);
        });

        it('should add credential to existing entry', async () => {
            // Given an existing passkey entry with one credential
            const existingCredentials: LocalPasskeyCredentialsEntry = [{id: 'existing', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}];

            // When adding a new credential
            addLocalPasskeyCredential({userId, credential, existingCredentials});
            await waitForBatchedUpdates();

            // Then both credentials should be stored in Onyx
            const value = await getOnyxValue(getPasskeyOnyxKey(userId));
            expect(value).toEqual([{id: 'existing', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}, credential]);
        });

        it('should throw error when credential with same id already exists', () => {
            // Given an existing entry that already contains a credential with the same id
            const existingCredentials: LocalPasskeyCredentialsEntry = [{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}];

            // When adding a credential with a duplicate id
            // Then it should throw an error
            expect(() => addLocalPasskeyCredential({userId, credential, existingCredentials})).toThrow();
        });
    });

    describe('deleteLocalPasskeyCredentials', () => {
        it('should throw error when userId is empty', () => {
            // Given an empty userId
            // When deleting credentials
            // Then it should throw an error
            expect(() => deleteLocalPasskeyCredentials('')).toThrow();
        });

        it('should delete existing passkey entry from Onyx', async () => {
            // Given a passkey entry stored in Onyx
            const entry: LocalPasskeyCredentialsEntry = [{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}];
            await Onyx.set(`${ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${userId}`, entry);
            await waitForBatchedUpdates();

            // When deleting credentials for the user
            deleteLocalPasskeyCredentials(userId);
            await waitForBatchedUpdates();

            // Then the entry should be an empty array
            const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${userId}`);
            expect(value).toEqual([]);
        });

        it('should handle deletion of non-existent entry gracefully', async () => {
            // Given no existing passkey entry in Onyx
            // When deleting credentials for the user
            deleteLocalPasskeyCredentials(userId);
            await waitForBatchedUpdates();

            // Then an empty array should be set
            const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${userId}`);
            expect(value).toEqual([]);
        });
    });

    describe('reconcileLocalPasskeysWithBackend', () => {
        it('should throw error when userId is empty', () => {
            // Given an empty userId
            // When reconciling credentials
            // Then it should throw an error
            expect(() => reconcileLocalPasskeysWithBackend({userId: '', backendCredentials: [], localCredentials: null})).toThrow();
        });

        it('should return empty array when localEntry is null', () => {
            // Given a null local entry
            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials: [], localCredentials: null});

            // Then it should return an empty array
            expect(result).toEqual([]);
        });

        it('should return empty array when localEntry has no credentials', () => {
            // Given a local entry with no credentials
            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials: [], localCredentials: []});

            // Then it should return an empty array
            expect(result).toEqual([]);
        });

        it('should return all matched credentials when all exist on backend', () => {
            // Given local credentials that all exist on the backend
            const localCredentials: PasskeyCredential[] = [
                {id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]},
                {id: 'cred-2', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.HYBRID]},
            ];
            const backendCredentials: BackendPasskeyCredential[] = [
                {id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE},
                {id: 'cred-2', type: CONST.PASSKEY_CREDENTIAL_TYPE},
            ];

            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials});

            // Then all local credentials should be returned
            expect(result).toEqual(localCredentials);
        });

        it('should remove local credentials not on backend and update Onyx', async () => {
            // Given two local credentials where only one exists on the backend
            const localCredentials: PasskeyCredential[] = [
                {id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]},
                {id: 'cred-2', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.HYBRID]},
            ];
            const backendCredentials: BackendPasskeyCredential[] = [{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE}];

            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials});
            await waitForBatchedUpdates();

            // Then only the matching credential should be returned and stored in Onyx
            expect(result).toEqual([{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}]);

            const value = await getOnyxValue(getPasskeyOnyxKey(userId));
            expect(value).toEqual([{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}]);
        });

        it('should set empty credentials when no credentials match backend', async () => {
            // Given a local credential that does not exist on the backend
            const localCredentials: PasskeyCredential[] = [{id: 'old-cred', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL]}];
            const backendCredentials: BackendPasskeyCredential[] = [{id: 'new-cred', type: CONST.PASSKEY_CREDENTIAL_TYPE}];

            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials});
            await waitForBatchedUpdates();

            // Then an empty array should be returned and Onyx should be empty
            expect(result).toEqual([]);

            const value = await getOnyxValue(getPasskeyOnyxKey(userId));
            expect(value).toEqual([]);
        });

        it('should preserve transports from local credentials', () => {
            // Given a local credential with multiple transports and a backend credential without transports
            const localCredentials: PasskeyCredential[] = [
                {id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE, transports: [CONST.PASSKEY_TRANSPORT.INTERNAL, CONST.PASSKEY_TRANSPORT.HYBRID]},
            ];
            const backendCredentials: BackendPasskeyCredential[] = [{id: 'cred-1', type: CONST.PASSKEY_CREDENTIAL_TYPE}];

            // When reconciling with backend
            const result = reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials});

            // Then the local transports should be preserved in the result
            expect(result).toEqual(localCredentials);
        });
    });
});
