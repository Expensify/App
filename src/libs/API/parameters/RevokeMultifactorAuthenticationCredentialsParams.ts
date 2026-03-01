/**
 * These two parameters are mutually exclusive:
 * - onlyKeyID - pass the current device's key ID to revoke the current device
 * - exceptKeyID - pass the current device's key ID to revoke all other devices
 *
 * If neither is passed, all devices will be revoked.
 */
type RevokeMultifactorAuthenticationCredentialsParams = {
    onlyKeyID?: string;
    exceptKeyID?: string;
};

export default RevokeMultifactorAuthenticationCredentialsParams;
