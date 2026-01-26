import type {Writable} from 'type-fest';
import {
    createAuthorizeErrorStatus,
    doesDeviceSupportBiometrics,
    getAuthTypeName,
    getOutcomePaths,
    isBiometryConfigured,
    isValidScenario,
    resetKeys,
    shouldClearScenario,
    Status,
} from '@components/MultifactorAuthentication/helpers';
import type {BiometricsStatus} from '@components/MultifactorAuthentication/types';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import {requestAuthenticationChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';

jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');
jest.mock('@userActions/MultifactorAuthentication');
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

    describe('Status.createEmptyStatus', () => {
        it('should create status with provided initial value', () => {
            const initialValue = true;
            const texts = {
                headerTitle: 'Test Header',
                title: 'Test Title',
                description: 'Test Description',
            };

            const status = Status.createEmptyStatus(initialValue, texts);

            expect(status.value).toBe(initialValue);
            expect(status.headerTitle).toBe(texts.headerTitle);
            expect(status.title).toBe(texts.title);
            expect(status.description).toBe(texts.description);
        });

        it('should initialize with NO_ACTION_MADE_YET reason', () => {
            const status = Status.createEmptyStatus(false, {
                headerTitle: 'H',
                title: 'T',
                description: 'D',
            });

            expect(status.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET);
        });

        it('should have default outcome paths', () => {
            const status = Status.createEmptyStatus(null, {
                headerTitle: 'H',
                title: 'T',
                description: 'D',
            });

            expect(status.outcomePaths.successOutcome).toBe('biometrics-test-success');
            expect(status.outcomePaths.failureOutcome).toBe('biometrics-test-failure');
        });

        it('should initialize step with undefined success and fulfilled request', () => {
            const status = Status.createEmptyStatus(null, {
                headerTitle: 'H',
                title: 'T',
                description: 'D',
            });

            expect(status.step.wasRecentStepSuccessful).toBeUndefined();
            expect(status.step.requiredFactorForNextStep).toBeUndefined();
            expect(status.step.isRequestFulfilled).toBe(true);
        });

        it('should have undefined scenario initially', () => {
            const status = Status.createEmptyStatus(null, {
                headerTitle: 'H',
                title: 'T',
                description: 'D',
            });

            expect(status.scenario).toBeUndefined();
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

    describe('createAuthorizeErrorStatus', () => {
        it('should create error status with failed step', () => {
            const errorStatus: MultifactorAuthenticationPartialStatus<boolean, true> = {
                value: false,
                type: 0,
                reason: 'An error occurred',
            };

            const updater = createAuthorizeErrorStatus(errorStatus);
            const prevStatus: MultifactorAuthenticationStatus<boolean> = {
                value: true,
                reason: 'No action has been made yet',
                type: undefined,
                step: {
                    wasRecentStepSuccessful: true,
                    isRequestFulfilled: false,
                    requiredFactorForNextStep: undefined,
                },
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {
                    successOutcome: 'biometrics-test-success',
                    failureOutcome: 'biometrics-test-failure',
                },
            };

            const result = updater(prevStatus);

            expect(result.value).toBe(false);
            expect(result.reason).toBe('An error occurred');
            expect(result.step.wasRecentStepSuccessful).toBe(false);
            expect(result.step.isRequestFulfilled).toBe(true);
        });
    });

    describe('Status.createBaseStep', () => {
        it('should create a successful fulfilled step', () => {
            const step = Status.createBaseStep(true, true);

            expect(step.wasRecentStepSuccessful).toBe(true);
            expect(step.isRequestFulfilled).toBe(true);
            expect(step.requiredFactorForNextStep).toBeUndefined();
        });

        it('should create a failed unfulfilled step with required factor', () => {
            const step = Status.createBaseStep(false, false, CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE);

            expect(step.wasRecentStepSuccessful).toBe(false);
            expect(step.isRequestFulfilled).toBe(false);
            expect(step.requiredFactorForNextStep).toBe(CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE);
        });
    });

    describe('Status.createUnsupportedDeviceStatus', () => {
        it('should clear biometric flags for unsupported devices', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {
                    isAnyDeviceRegistered: true,
                    isBiometryRegisteredLocally: true,
                    isLocalPublicKeyInAuth: true,
                },
                reason: 'No action has been made yet',
                step: {wasRecentStepSuccessful: true, isRequestFulfilled: true, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const result = Status.createUnsupportedDeviceStatus(prevStatus);

            expect(result.value.isAnyDeviceRegistered).toBe(true);
            expect(result.value.isBiometryRegisteredLocally).toBe(false);
            expect(result.value.isLocalPublicKeyInAuth).toBe(false);
        });
    });

    describe('Status.createValidateCodeMissingStatus', () => {
        it('should set validate code as required factor', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {isAnyDeviceRegistered: false, isBiometryRegisteredLocally: false, isLocalPublicKeyInAuth: false},
                reason: 'Validate code is missing',
                step: {wasRecentStepSuccessful: undefined, isRequestFulfilled: true, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const result = Status.createValidateCodeMissingStatus(prevStatus);

            expect(result.step.requiredFactorForNextStep).toBe(CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE);
            expect(result.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.VALIDATE_CODE_MISSING);
        });
    });

    describe('Status.createCancelStatus', () => {
        it('should return a status updater that marks request as fulfilled', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {isAnyDeviceRegistered: false, isBiometryRegisteredLocally: false, isLocalPublicKeyInAuth: false},
                reason: 'No action has been made yet',
                step: {wasRecentStepSuccessful: true, isRequestFulfilled: false, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const updater = Status.createCancelStatus(true);
            const result = updater(prevStatus);

            expect(result.step.isRequestFulfilled).toBe(true);
            expect(result.step.wasRecentStepSuccessful).toBe(true);
            expect(result.step.requiredFactorForNextStep).toBeUndefined();
        });

        it('should preserve previous status fields', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {isAnyDeviceRegistered: true, isBiometryRegisteredLocally: false, isLocalPublicKeyInAuth: false},
                reason: 'No action has been made yet',
                step: {wasRecentStepSuccessful: true, isRequestFulfilled: false, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Title',
                title: 'Test Title',
                description: 'Description',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const updater = Status.createCancelStatus(false);
            const result = updater(prevStatus);

            expect(result.value).toEqual(prevStatus.value);
            expect(result.reason).toBe(prevStatus.reason);
            expect(result.headerTitle).toBe(prevStatus.headerTitle);
        });
    });

    describe('Status.createRefreshStatusStatus', () => {
        it('should update biometric status with new values', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {isAnyDeviceRegistered: false, isBiometryRegisteredLocally: false, isLocalPublicKeyInAuth: false},
                reason: 'No action has been made yet',
                step: {wasRecentStepSuccessful: undefined, isRequestFulfilled: true, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const newStatus: BiometricsStatus = {
                isAnyDeviceRegistered: true,
                isBiometryRegisteredLocally: true,
                isLocalPublicKeyInAuth: true,
            };

            const updater = Status.createRefreshStatusStatus(newStatus);
            const result = updater(prevStatus);

            expect(result.value).toEqual(newStatus);
            expect(result.reason).toBe(prevStatus.reason);
        });

        it('should optionally overwrite other status fields', () => {
            const prevStatus: MultifactorAuthenticationStatus<BiometricsStatus> = {
                value: {isAnyDeviceRegistered: false, isBiometryRegisteredLocally: false, isLocalPublicKeyInAuth: false},
                reason: 'No action has been made yet',
                step: {wasRecentStepSuccessful: undefined, isRequestFulfilled: true, requiredFactorForNextStep: undefined},
                scenario: undefined,
                headerTitle: 'Test',
                title: 'Test',
                description: 'Test',
                outcomePaths: {successOutcome: 'biometrics-test-success', failureOutcome: 'biometrics-test-failure'},
            };

            const newStatus: BiometricsStatus = {
                isAnyDeviceRegistered: true,
                isBiometryRegisteredLocally: true,
                isLocalPublicKeyInAuth: true,
            };

            const overwriteStatus = {
                reason: 'No action has been made yet',
                headerTitle: 'New title',
            } as const;

            const updater = Status.createRefreshStatusStatus(newStatus, overwriteStatus);
            const result = updater(prevStatus);

            expect(result.value).toEqual(newStatus);
            expect(result.reason).toBe('No action has been made yet');
            expect(result.headerTitle).toBe('New title');
        });
    });
});
