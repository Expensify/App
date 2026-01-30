import {getOutcomePath, getOutcomePaths} from '@components/MultifactorAuthentication/config/outcomePaths';
import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';
import {processRegistration} from '@userActions/MultifactorAuthentication/processing';
import CONST from '@src/CONST';

jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');
jest.mock('@userActions/MultifactorAuthentication');

describe('MultifactorAuthentication helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

        it('should return failure when challenge is missing', async () => {
            const result = await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: '',
                currentPublicKeyIDs: [],
            });

            expect(result.success).toBe(false);
        });

        it('should call registerAuthenticationKey with correct parameters', async () => {
            await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
                currentPublicKeyIDs: [],
            });

            expect(registerAuthenticationKey).toHaveBeenCalledWith({
                keyInfo: expect.objectContaining({
                    rawId: 'public-key-123',
                    type: 'biometric',
                }),
                authenticationMethod: 'BIOMETRIC_FACE',
                publicKey: 'public-key-123',
                currentPublicKeyIDs: [],
            });
        });

        it('should return success when HTTP response starts with 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 201,
                reason: 'Created',
            });

            const result = await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
                currentPublicKeyIDs: [],
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
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
                currentPublicKeyIDs: [],
            });

            expect(result.success).toBe(false);
        });
    });
});
