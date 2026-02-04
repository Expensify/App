/** Represents the transport method for a passkey credential */
type PasskeyTransport = 'internal' | 'hybrid' | 'usb' | 'nfc' | 'ble';

/** Represents a single credential stored locally for a passkey */
type PasskeyCredential = {
    /** base64url-encoded credential ID */
    id: string;

    /** The type of credential (always "public-key" for WebAuthn) */
    type: 'public-key';

    /** Optional array of transport methods that can be used to communicate with the authenticator */
    transports?: PasskeyTransport[];
};

/**
 * Represents a locally stored passkey entry for a specific user and relying party combination.
 * These entries are stored in Onyx to track which passkeys have been registered on this browser/device.
 * The storage key format is: passkey_${userId}@${rpId}
 */
type LocalPasskeyEntry = {
    /** Array of credentials registered for this user on this device/browser */
    credentialIds: PasskeyCredential[];
};

export default LocalPasskeyEntry;
export type {PasskeyCredential, PasskeyTransport};
