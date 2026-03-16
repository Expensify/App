import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';
import {processRegistration} from '@userActions/MultifactorAuthentication/processing';

jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');
jest.mock('@userActions/MultifactorAuthentication');

describe('MultifactorAuthentication helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('processRegistration', () => {
        beforeEach(() => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpStatusCode: 200,
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
            });

            expect(registerAuthenticationKey).toHaveBeenCalledWith({
                keyInfo: expect.objectContaining({
                    rawId: 'public-key-123',
                    type: 'biometric',
                }),
                authenticationMethod: 'BIOMETRIC_FACE',
            });
        });

        // Given a successful backend response with HTTP code 201
        // When processRegistration receives this 2xx status code
        // Then it should return success because 2xx status codes indicate the credential was successfully registered on the backend
        it('should return success when HTTP response starts with 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpStatusCode: 201,
                reason: 'Created',
            });

            const result = await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(result.success).toBe(true);
        });

        // Given a failed backend response with HTTP code 400
        // When processRegistration receives this non-2xx status code
        // Then it should return failure because non-2xx status codes indicate the credential registration was rejected by the backend
        it('should return failure when HTTP response does not start with 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpStatusCode: 400,
                reason: 'Bad request',
            });

            const result = await processRegistration({
                publicKey: 'public-key-123',
                authenticationMethod: 'BIOMETRIC_FACE',
                challenge: 'challenge-123',
            });

            expect(result.success).toBe(false);
        });
    });
});
