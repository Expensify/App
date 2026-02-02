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
        // Given no scenario is provided
        // When getOutcomePaths is called with undefined
        // Then it should return default paths for the biometrics-test scenario because all MFA flows need fallback outcome routes
        it('should return default paths when scenario is undefined', () => {
            const result = getOutcomePaths(undefined);

            expect(result.successOutcome).toBe('biometrics-test-success');
            expect(result.failureOutcome).toBe('biometrics-test-failure');
        });

        // Given a specific MFA scenario (biometrics-test)
        // When getOutcomePaths is called with that scenario
        // Then it should include the scenario name in both success and failure paths because navigation routes must be scenario-specific for proper flow routing
        it('should include scenario prefix in outcome paths', () => {
            const result = getOutcomePaths(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);

            expect(result.successOutcome).toContain('biometrics-test');
            expect(result.successOutcome).toContain('success');
            expect(result.failureOutcome).toContain('biometrics-test');
            expect(result.failureOutcome).toContain('failure');
        });

        // Given a scenario with uppercase name constant (BIOMETRICS_TEST)
        // When getOutcomePaths converts it to a route path
        // Then it should lowercase the scenario name because route paths use lowercase kebab-case format for consistency with URL conventions
        it('should lowercase scenario name in path', () => {
            const result = getOutcomePaths(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);

            expect(result.successOutcome).toBe('biometrics-test-success');
            expect(result.failureOutcome).toBe('biometrics-test-failure');
        });
    });

    describe('getOutcomePath', () => {
        // Given a scenario name and success outcome type
        // When getOutcomePath is called with these parameters
        // Then it should construct a path that includes both the scenario prefix and success suffix because the path must uniquely identify which scenario succeeded
        it('should construct outcome path with scenario prefix and success suffix', () => {
            const result = getOutcomePath('biometrics-test', 'success');
            expect(result).toContain('success');
            expect(result).toContain('biometrics-test');
        });

        // Given a scenario name and failure outcome type
        // When getOutcomePath is called with these parameters
        // Then it should construct a path that includes both the scenario prefix and failure suffix because the path must uniquely identify which scenario failed
        it('should construct outcome path with scenario prefix and failure suffix', () => {
            const result = getOutcomePath('biometrics-test', 'failure');
            expect(result).toContain('failure');
            expect(result).toContain('biometrics-test');
        });

        // Given no scenario is provided to getOutcomePath
        // When getOutcomePath is called with undefined and a success outcome type
        // Then it should use the default scenario prefix (biometrics-test) because all outcome paths need a fallback prefix for error scenarios
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

        // Given a registration request without a challenge
        // When processRegistration is called with an empty challenge string
        // Then it should return failure because a challenge is required to prove the registration request is legitimate and came from the server
        it('should return failure when challenge is missing', async () => {
            const result = await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: '',
                currentPublicKeyIDs: [],
            });

            expect(result.success).toBe(false);
        });

        // Given all required registration parameters including a valid challenge
        // When processRegistration is called with these parameters
        // Then it should pass the correct keyInfo object and metadata to registerAuthenticationKey because the backend needs specific formatting for the public key and challenge to properly register the credential
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

        // Given a successful backend response with HTTP code 201
        // When processRegistration receives this 2xx status code
        // Then it should return success because 2xx status codes indicate the credential was successfully registered on the backend
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

        // Given a failed backend response with HTTP code 400
        // When processRegistration receives this non-2xx status code
        // Then it should return failure because non-2xx status codes indicate the credential registration was rejected by the backend
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
