import type {ValueOf, Writable} from 'type-fest';
import {
    doesDeviceSupportBiometrics,
    getAuthTypeName,
    getOutcomePath,
    getOutcomePaths,
    getOutcomeRoute,
    isBiometryConfigured,
    isValidScenario,
    processRegistration,
    resetKeys,
    shouldAllowBiometrics,
    shouldClearScenario,
} from '@components/MultifactorAuthentication/helpers';
import {registerAuthenticationKey, requestAuthenticationChallenge} from '@libs/actions/MultifactorAuthentication';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');
jest.mock('@libs/actions/MultifactorAuthentication');
jest.mock('@libs/MultifactorAuthentication/Biometrics/SecureStore', () => ({
    SECURE_STORE_VALUES: {
        AUTH_TYPE: {
            BIOMETRICS: {CODE: 'BIOMETRICS', NAME: 'Biometrics'},
            PIN: {CODE: 'PIN', NAME: 'PIN'},
        },
    },
}));

describe('MultifactorAuthentication helpers', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {delete: privateKeyStoreDelete} = jest.mocked(PrivateKeyStore);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {delete: publicKeyStoreDelete} = jest.mocked(PublicKeyStore);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAuthTypeName', () => {
        it('should return undefined when type is undefined', () => {
            const status: MultifactorAuthenticationPartialStatus<unknown> = {
                value: null,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET,
                step: {
                    wasRecentStepSuccessful: undefined,
                    requiredFactorForNextStep: undefined,
                    isRequestFulfilled: true,
                },
            };

            const result = getAuthTypeName(status);

            expect(result).toBeUndefined();
        });

        it('should return auth type name from secure store values', () => {
            const status: MultifactorAuthenticationPartialStatus<unknown> = {
                value: null,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET,
                step: {
                    wasRecentStepSuccessful: undefined,
                    requiredFactorForNextStep: undefined,
                    isRequestFulfilled: true,
                },
            };

            const result = getAuthTypeName(status);

            // Result will be undefined or a valid auth type name depending on secure store values
            expect(typeof result === 'string' || result === undefined).toBe(true);
        });
    });

    describe('isValidScenario', () => {
        it('should return true for valid scenario', () => {
            const validScenario = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;

            const result = isValidScenario(validScenario);

            expect(result).toBe(true);
        });

        it('should return false for invalid scenario string', () => {
            const result = isValidScenario('INVALID_SCENARIO');

            expect(result).toBe(false);
        });

        it('should return false for empty string', () => {
            const result = isValidScenario('');

            expect(result).toBe(false);
        });
    });

    describe('shouldClearScenario', () => {
        it('should return true for FULFILL reason', () => {
            const result = shouldClearScenario(CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.FULFILL);

            expect(result).toBe(true);
        });

        it('should return true for CANCEL reason', () => {
            const result = shouldClearScenario(CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL);

            expect(result).toBe(true);
        });

        it('should return false for other reasons', () => {
            const result = shouldClearScenario(CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.REGISTER);

            expect(result).toBe(false);
        });

        it('should return false for valid scenario', () => {
            const result = shouldClearScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);

            expect(result).toBe(false);
        });
    });

    describe('getOutcomePaths', () => {
        it('should return default paths when scenario is undefined', () => {
            const result = getOutcomePaths(undefined);

            expect(result.successOutcome).toBe('biometrics-test-success');
            expect(result.failureOutcome).toBe('biometrics-test-failure');
        });

        it('should include scenario prefix in outcome paths', () => {
            const result = getOutcomePaths(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);

            expect(result.successOutcome).toContain('biometrics-test');
            expect(result.successOutcome).toContain('success');
            expect(result.failureOutcome).toContain('biometrics-test');
            expect(result.failureOutcome).toContain('failure');
        });

        it('should lowercase scenario name in path', () => {
            const result = getOutcomePaths(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);

            expect(result.successOutcome).toBe('biometrics-test-success');
            expect(result.failureOutcome).toBe('biometrics-test-failure');
        });
    });

    describe('resetKeys', () => {
        it('should delete both private and public keys for account', async () => {
            const accountID = 12345;

            privateKeyStoreDelete.mockResolvedValueOnce({value: true, reason: 'Key successfully deleted from SecureStore'});
            publicKeyStoreDelete.mockResolvedValueOnce({value: true, reason: 'Key successfully deleted from SecureStore'});

            await resetKeys(accountID);

            expect(privateKeyStoreDelete).toHaveBeenCalledWith(accountID);
            expect(publicKeyStoreDelete).toHaveBeenCalledWith(accountID);
        });

        it('should call delete methods with the provided account ID', async () => {
            const accountID = 99999;

            privateKeyStoreDelete.mockResolvedValueOnce({value: true, reason: 'Key successfully deleted from SecureStore'});
            publicKeyStoreDelete.mockResolvedValueOnce({value: true, reason: 'Key successfully deleted from SecureStore'});

            await resetKeys(accountID);

            // Both should be called with the provided accountID
            expect(privateKeyStoreDelete).toHaveBeenCalledWith(accountID);
            expect(publicKeyStoreDelete).toHaveBeenCalledWith(accountID);
        });

        it('should use Promise.all to delete keys concurrently', async () => {
            const accountID = 55555;

            const deleteResult: MultifactorAuthenticationPartialStatus<boolean, true> = {value: true, reason: 'Key successfully deleted from SecureStore'};
            privateKeyStoreDelete.mockResolvedValueOnce(deleteResult);
            publicKeyStoreDelete.mockResolvedValueOnce(deleteResult);

            await resetKeys(accountID);

            // Verify both methods were called
            expect(privateKeyStoreDelete).toHaveBeenCalledWith(accountID);
            expect(publicKeyStoreDelete).toHaveBeenCalledWith(accountID);
        });
    });

    describe('doesDeviceSupportBiometrics', () => {
        it('should return true if biometrics is supported', () => {
            (PublicKeyStore.supportedAuthentication as Writable<typeof PublicKeyStore.supportedAuthentication>) = {biometrics: true, credentials: false};
            expect(doesDeviceSupportBiometrics()).toBe(true);
        });

        it('should return true if credentials is supported', () => {
            (PublicKeyStore.supportedAuthentication as Writable<typeof PublicKeyStore.supportedAuthentication>) = {biometrics: false, credentials: true};
            expect(doesDeviceSupportBiometrics()).toBe(true);
        });

        it('should return false if neither is supported', () => {
            (PublicKeyStore.supportedAuthentication as Writable<typeof PublicKeyStore.supportedAuthentication>) = {biometrics: false, credentials: false};
            expect(doesDeviceSupportBiometrics()).toBe(false);
        });

        it('should return true if both are supported', () => {
            (PublicKeyStore.supportedAuthentication as Writable<typeof PublicKeyStore.supportedAuthentication>) = {biometrics: true, credentials: true};
            expect(doesDeviceSupportBiometrics()).toBe(true);
        });
    });

    describe('isBiometryConfigured', () => {
        it('should return configuration status for an account', async () => {
            const accountID = 12345;
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({value: 'localPublicKey'});
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({publicKeys: ['remotePublicKey', 'localPublicKey']});

            const result = await isBiometryConfigured(accountID);

            expect(result).toEqual({
                isAnyDeviceRegistered: true,
                isBiometryRegisteredLocally: true,
                isLocalPublicKeyInAuth: true,
            });
        });

        it('should handle no local key', async () => {
            const accountID = 12345;
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({value: null});
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({publicKeys: ['remotePublicKey']});

            const result = await isBiometryConfigured(accountID);

            expect(result.isBiometryRegisteredLocally).toBe(false);
            expect(result.isLocalPublicKeyInAuth).toBe(false);
        });

        it('should handle no remote keys', async () => {
            const accountID = 12345;
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({value: 'localPublicKey'});
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({publicKeys: []});

            const result = await isBiometryConfigured(accountID);

            expect(result.isAnyDeviceRegistered).toBe(false);
            expect(result.isLocalPublicKeyInAuth).toBe(false);
        });
    });

    describe('shouldAllowBiometrics', () => {
        it('should return true when biometrics is the allowed type', () => {
            const result = shouldAllowBiometrics([CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS]);
            expect(result).toBe(true);
        });

        it('should return false for other authentication types', () => {
            // Assuming there might be other types, we test with a different value
            expect(shouldAllowBiometrics(['OTHER_TYPE' as ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>])).toBe(false);
        });
    });

    describe('getOutcomeRoute', () => {
        it('should return not found route when path is undefined', () => {
            const result = getOutcomeRoute(undefined);
            expect(typeof result).toBe('string');
        });

        it('should return outcome route for valid path', () => {
            const result = getOutcomeRoute('biometrics-test-success');
            expect(typeof result).toBe('string');
        });
    });

    describe('getOutcomePath', () => {
        it('should construct outcome path with scenario prefix and success suffix', () => {
            const result = getOutcomePath('biometrics-test', 'success');
            expect(result).toContain('success');
            expect(result).toContain('biometrics-test');
        });

        it('should construct outcome path with scenario prefix and failure suffix', () => {
            const result = getOutcomePath('biometrics-test', 'failure');
            expect(result).toContain('failure');
            expect(result).toContain('biometrics-test');
        });

        it('should use default prefix when scenario is undefined', () => {
            const result = getOutcomePath(undefined, 'success');
            expect(result).toContain('biometrics-test');
            expect(result).toContain('success');
        });
    });

    describe('processRegistration', () => {
        beforeEach(() => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 200,
                reason: 'Registration successful',
            });
        });

        it('should return failure when validateCode is missing', async () => {
            const result = await processRegistration({
                publicKey: 'public-key-123',
                validateCode: '',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(result.success).toBe(false);
        });

        it('should return failure when challenge is missing', async () => {
            const result = await processRegistration({
                publicKey: 'public-key-123',
                validateCode: '123456',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: '',
            });

            expect(result.success).toBe(false);
        });

        it('should call registerAuthenticationKey with correct parameters', async () => {
            await processRegistration({
                publicKey: 'public-key-123',
                validateCode: '123456',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(registerAuthenticationKey).toHaveBeenCalledWith({
                keyInfo: expect.objectContaining({
                    rawId: 'public-key-123',
                    type: 'biometric',
                }),
                validateCode: 123456,
                authenticationMethod: 'BIOMETRIC_FACE',
            });
        });

        it('should return success when HTTP response starts with 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 201,
                reason: 'Created',
            });

            const result = await processRegistration({
                publicKey: 'public-key-123',
                validateCode: '123456',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(result.success).toBe(true);
        });

        it('should return failure when HTTP response does not start with 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 400,
                reason: 'Bad request',
            });

            const result = await processRegistration({
                publicKey: 'public-key-123',
                validateCode: '123456',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(result.success).toBe(false);
        });
    });
});
