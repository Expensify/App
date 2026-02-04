import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocalPasskeyEntry, PasskeyCredential} from '@src/types/onyx';

/** Returns Onyx key: passkey_${userId}@${rpId} */
function getPasskeyOnyxKey(userId: string, rpId: string): `${typeof ONYXKEYS.COLLECTION.PASSKEYS}${string}` {
    return `${ONYXKEYS.COLLECTION.PASSKEYS}${userId}@${rpId}`;
}

type SetLocalPasskeyCredentialsParams = {
    userId: string;
    rpId: string;
    entry: LocalPasskeyEntry;
};

/**
 * Sets passkey credentials in Onyx storage.
 * We use Onyx.set() instead of Onyx.merge() because passkey entries contain an array of credentials
 * that needs to be fully replaced, not merged. Using merge() would append to the array instead of replacing it.
 */
function setLocalPasskeyCredentials({userId, rpId, entry}: SetLocalPasskeyCredentialsParams): void {
    Onyx.set(getPasskeyOnyxKey(userId, rpId), entry);
}

type AddLocalPasskeyCredentialParams = {
    userId: string;
    rpId: string;
    credential: PasskeyCredential;
    existingEntry: LocalPasskeyEntry | null;
};

function addLocalPasskeyCredential({userId, rpId, credential, existingEntry}: AddLocalPasskeyCredentialParams): void {
    const existingCredentials = existingEntry?.credentialIds ?? [];
    const credentialExists = existingCredentials.some((c) => c.id === credential.id);

    if (credentialExists) {
        const updatedCredentials = existingCredentials.map((c) => (c.id === credential.id ? credential : c));
        setLocalPasskeyCredentials({userId, rpId, entry: {credentialIds: updatedCredentials}});
    } else {
        setLocalPasskeyCredentials({userId, rpId, entry: {credentialIds: [...existingCredentials, credential]}});
    }
}

/** Deletes all passkey credentials for a user/rpId from Onyx storage */
function deleteLocalPasskeyCredentials(userId: string, rpId: string): void {
    Onyx.set(getPasskeyOnyxKey(userId, rpId), null);
}

/** Backend returns simplified format without transports */
type BackendCredential = {
    id: string;
    type: 'public-key';
};

type ReconcileLocalPasskeysWithBackendParams = {
    userId: string;
    rpId: string;
    allowCredentials: BackendCredential[];
    localEntry: LocalPasskeyEntry | null;
};

/**
 * Reconciles local Onyx passkeys with backend allowCredentials.
 * Removes local credentials that no longer exist on backend.
 */
function reconcileLocalPasskeysWithBackend({userId, rpId, allowCredentials, localEntry}: ReconcileLocalPasskeysWithBackendParams): PasskeyCredential[] {
    if (!localEntry || localEntry.credentialIds.length === 0) {
        return [];
    }

    const backendCredentialIds = new Set(allowCredentials.map((c) => c.id));
    const matchedCredentials = localEntry.credentialIds.filter((c) => backendCredentialIds.has(c.id));

    if (matchedCredentials.length !== localEntry.credentialIds.length) {
        if (matchedCredentials.length === 0) {
            deleteLocalPasskeyCredentials(userId, rpId);
        } else {
            setLocalPasskeyCredentials({userId, rpId, entry: {credentialIds: matchedCredentials}});
        }
    }

    return matchedCredentials;
}

export {getPasskeyOnyxKey, addLocalPasskeyCredential, deleteLocalPasskeyCredentials, reconcileLocalPasskeysWithBackend};
export type {BackendCredential};
