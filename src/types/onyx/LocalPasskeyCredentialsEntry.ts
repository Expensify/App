import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Represents the transport method for a passkey credential */
type PasskeyTransport = ValueOf<typeof CONST.PASSKEY_TRANSPORT>;

/** Represents a single credential stored locally for a passkey */
type PasskeyCredential = {
    /** base64url-encoded credential ID */
    id: string;

    /** The type of credential (always "public-key" for WebAuthn) */
    type: typeof CONST.PASSKEY_CREDENTIAL_TYPE;

    /** Optional array of transport methods that can be used to communicate with the authenticator */
    transports?: PasskeyTransport[];
};

/**
 * Represents locally stored passkey credentials for a specific user.
 * These entries are stored in Onyx to track which passkeys have been registered on this browser/device.
 * The storage key format is: passkey_${userId}
 */
type LocalPasskeyCredentialsEntry = PasskeyCredential[];

export default LocalPasskeyCredentialsEntry;
export type {PasskeyCredential, PasskeyTransport};
