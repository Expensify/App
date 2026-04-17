import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';
import {processRegistration, processScenarioAction} from '@userActions/MultifactorAuthentication/processing';
import CONST from '@src/CONST';

jest.mock('@userActions/MultifactorAuthentication');

describe('MultifactorAuthentication processing', () => {
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

        // Given a keyInfo object with biometric type (HSM)
        // When processRegistration is called
        // Then it should forward keyInfo to registerAuthenticationKey
        it('should call registerAuthenticationKey with the provided keyInfo', async () => {
            const keyInfo = {
                rawId: 'public-key-123',
                type: 'biometric-hsm' as const,
                response: {
                    clientDataJSON: 'encoded-client-data',
                    biometric: {publicKey: 'public-key-123', algorithm: CONST.COSE_ALGORITHM.ES256},
                },
            };

            await processRegistration({
                keyInfo,
            });

            expect(registerAuthenticationKey).toHaveBeenCalledWith({
                keyInfo,
            });
        });

        // Given a keyInfo object with public-key type (Passkeys)
        // When processRegistration is called
        // Then it should forward keyInfo to registerAuthenticationKey
        it('should call registerAuthenticationKey with passkey keyInfo', async () => {
            const keyInfo = {
                rawId: 'passkey-raw-id',
                type: 'public-key' as const,
                response: {
                    clientDataJSON: 'client-data-json-base64',
                    attestationObject: 'attestation-object-base64',
                },
            };

            await processRegistration({
                keyInfo,
            });

            expect(registerAuthenticationKey).toHaveBeenCalledWith({
                keyInfo,
            });
        });

        // Given a successful backend response with HTTP code 201
        // When processRegistration receives this 2xx status code
        // Then it should return success because 2xx status codes indicate the credential was successfully registered on the backend
        it('should return success when HTTP response is 2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpStatusCode: 201,
                reason: 'Created',
            });

            const result = await processRegistration({
                keyInfo: {rawId: 'key', type: 'biometric-hsm' as const, response: {clientDataJSON: 'cdj', biometric: {publicKey: 'key', algorithm: CONST.COSE_ALGORITHM.ES256}}},
            });

            expect(result.success).toBe(true);
        });

        // Given a failed backend response with HTTP code 400
        // When processRegistration receives this non-2xx status code
        // Then it should return failure because non-2xx status codes indicate the credential registration was rejected by the backend
        it('should return failure when HTTP response is non-2xx', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpStatusCode: 400,
                reason: 'Bad request',
            });

            const result = await processRegistration({
                keyInfo: {rawId: 'key', type: 'biometric-hsm' as const, response: {clientDataJSON: 'cdj', biometric: {publicKey: 'key', algorithm: CONST.COSE_ALGORITHM.ES256}}},
            });

            expect(result.success).toBe(false);
        });
    });

    describe('processScenarioAction', () => {
        const mockAction = jest.fn();

        beforeEach(() => {
            mockAction.mockResolvedValue({
                httpStatusCode: 200,
                reason: 'Action successful',
            });
        });

        const validSignedChallenge = {
            rawId: 'raw-1',
            type: 'public-key',
            response: {authenticatorData: 'ad', clientDataJSON: 'cdj', signature: 'sig'},
        } as const;

        // Given a scenario action call without a signedChallenge
        // When processScenarioAction is called with an empty signedChallenge
        // Then it should return failure because the signature is required to prove authenticity
        it('should return failure when signedChallenge is missing', async () => {
            const result = await processScenarioAction(mockAction, {
                signedChallenge: '' as unknown as Parameters<typeof processScenarioAction>[1]['signedChallenge'],
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.success).toBe(false);
            expect(mockAction).not.toHaveBeenCalled();
        });

        // Given valid parameters with a signedChallenge
        // When processScenarioAction is called
        // Then it should forward all params to the action function
        it('should call the action function with provided params', async () => {
            const params = {
                signedChallenge: validSignedChallenge,
                authenticationMethod: 'BIOMETRIC_FACE' as const,
            };

            await processScenarioAction(mockAction, params);

            expect(mockAction).toHaveBeenCalledWith(params);
        });

        // Given the action returns a 2xx HTTP status
        // When processScenarioAction receives the response
        // Then it should return success
        it('should return success when action returns 2xx', async () => {
            const result = await processScenarioAction(mockAction, {
                signedChallenge: validSignedChallenge,
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.success).toBe(true);
        });

        // Given the action returns a non-2xx HTTP status
        // When processScenarioAction receives the response
        // Then it should return failure
        it('should return failure when action returns non-2xx', async () => {
            mockAction.mockResolvedValue({
                httpStatusCode: 403,
                reason: 'Forbidden',
            });

            const result = await processScenarioAction(mockAction, {
                signedChallenge: validSignedChallenge,
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.success).toBe(false);
        });

        // Given the action returns a response body with scenario-specific data
        // When processScenarioAction receives the response
        // Then it should forward the body in the result
        it('should forward body from action response', async () => {
            mockAction.mockResolvedValue({
                httpStatusCode: 200,
                reason: 'Success',
                body: {pin: 1234},
            });

            const result = await processScenarioAction(mockAction, {
                signedChallenge: validSignedChallenge,
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.success).toBe(true);
            expect(result.body).toEqual({pin: 1234});
        });
    });
});
