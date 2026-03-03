import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocalPasskeyCredentialsEntry, PasskeyCredential} from '@src/types/onyx';

/** Identifies a passkey storage scope for a specific user */
type PasskeyScope = {
    userId: string;
};

/** Returns Onyx key: passkey_${userId} */
function getPasskeyOnyxKey(userId: string): `${typeof ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${string}` {
    return `${ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS}${userId}`;
}

type SetLocalPasskeyCredentialsParams = PasskeyScope & {
    entry: LocalPasskeyCredentialsEntry;
};

/**
 * Sets passkey credentials in Onyx storage.
 * We use Onyx.set() instead of Onyx.merge() because passkey entries contain an array of credentials
 * that needs to be fully replaced, not merged. Using merge() would append to the array instead of replacing it.
 */
function setLocalPasskeyCredentials({userId, entry}: SetLocalPasskeyCredentialsParams): void {
    if (!userId) {
        throw new Error('userId is required to store passkey credentials');
    }
    Onyx.set(getPasskeyOnyxKey(userId), entry);
}

type AddLocalPasskeyCredentialParams = PasskeyScope & {
    credential: PasskeyCredential;
    existingCredentials: LocalPasskeyCredentialsEntry | null;
};

function addLocalPasskeyCredential({userId, credential, existingCredentials}: AddLocalPasskeyCredentialParams): void {
    const credentials = existingCredentials ?? [];

    if (credentials.some((c) => c.id === credential.id)) {
        throw new Error(`Passkey credential with id "${credential.id}" already exists for user ${userId}`);
    }

    setLocalPasskeyCredentials({userId, entry: [...credentials, credential]});
}

/** Deletes all passkey credentials for a user from Onyx storage */
function deleteLocalPasskeyCredentials(userId: string): void {
    if (!userId) {
        throw new Error('userId is required to delete passkey credentials');
    }
    Onyx.set(getPasskeyOnyxKey(userId), []);
}

/** Backend returns simplified format without transports */
type BackendPasskeyCredential = Omit<PasskeyCredential, 'transports'>;

type ReconcileLocalPasskeysWithBackendParams = PasskeyScope & {
    backendCredentials: BackendPasskeyCredential[];
    localCredentials: LocalPasskeyCredentialsEntry | null;
};

/**
 * Reconciles local Onyx passkeys with backend allowCredentials.
 * Removes local credentials that no longer exist on backend and updates Onyx accordingly.
 *
 * Returns the matched credentials (with locally preserved transports) so the caller
 * can pass them directly as `allowCredentials` to `navigator.credentials.get()`.
 */
function reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials}: ReconcileLocalPasskeysWithBackendParams): PasskeyCredential[] {
    if (!userId) {
        throw new Error('userId is required to reconcile passkey credentials');
    }
    if (!localCredentials || localCredentials.length === 0) {
        return [];
    }

    const backendCredentialIds = new Set(backendCredentials.map((c) => c.id));
    const matchedCredentials = localCredentials.filter((c) => backendCredentialIds.has(c.id));

    if (matchedCredentials.length !== localCredentials.length) {
        setLocalPasskeyCredentials({userId, entry: matchedCredentials});
    }

    return matchedCredentials;
}

export {getPasskeyOnyxKey, addLocalPasskeyCredential, deleteLocalPasskeyCredentials, reconcileLocalPasskeysWithBackend};
export type {BackendPasskeyCredential};
