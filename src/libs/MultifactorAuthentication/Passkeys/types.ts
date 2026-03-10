/**
 * Type definitions specific to passkey/WebAuthn authentication.
 */
type PasskeyRegistrationKeyInfo = {
    rawId: string;
    type: 'public-key';
    response: {
        clientDataJSON: string;
        attestationObject: string;
    };
};

// eslint-disable-next-line import/prefer-default-export
export type {PasskeyRegistrationKeyInfo};
