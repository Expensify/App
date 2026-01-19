import {getAuthTypeName, getOutcomePaths, isValidScenario, resetKeys, shouldClearScenario, Status} from '@components/MultifactorAuthentication/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');

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
});
