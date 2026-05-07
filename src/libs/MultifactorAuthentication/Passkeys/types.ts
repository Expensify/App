/**
 * Type definitions specific to passkey/WebAuthn authentication.
 */
type PasskeyRegistrationKeyInfo = {
    rawId: string;
    type: 'public-key';
    transports?: string[];
    aaguid?: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
    };
};

// eslint-disable-next-line import/prefer-default-export -- type alias cannot be a default export without violating no-restricted-exports
export type {PasskeyRegistrationKeyInfo};
