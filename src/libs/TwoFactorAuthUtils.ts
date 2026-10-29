/**
 * Splits the two-factor auth secret key in 4 chunks of 4 characters each
 */
function splitSecretInChunks(secret: string): string {
    if (secret.length !== 16) {
        return secret;
    }

    return `${secret.slice(0, 4)} ${secret.slice(4, 8)} ${secret.slice(8, 12)} ${secret.slice(12, secret.length)}`;
}

/**
 * Builds the URL string to generate the QRCode, using the otpauth:// protocol,
 * so it can be detected by authenticator apps
 */
function buildAuthenticatorUrl(contactMethod: string, secretKey: string): string {
    return `otpauth://totp/Expensify:${contactMethod}?secret=${secretKey}&issuer=Expensify`;
}

export {splitSecretInChunks, buildAuthenticatorUrl};
