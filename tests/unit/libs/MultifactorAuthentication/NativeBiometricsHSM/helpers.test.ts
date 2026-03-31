import {Buffer} from 'buffer';
import {buildSigningData, getKeyAlias, mapAuthTypeNumber, mapLibraryError, mapSignErrorCode} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

const mockSha256 = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true}),
    sha256: (...args: unknown[]): Promise<{hash: string}> => mockSha256(...args) as Promise<{hash: string}>,
}));

describe('NativeBiometricsHSM helpers', () => {
    describe('getKeyAlias', () => {
        it('should build alias from accountID and HSM_KEY_SUFFIX', () => {
            // Given a valid account ID
            // When generating a key alias for biometric key storage
            // Then the alias should combine the account ID with the HSM suffix to uniquely identify the key per account
            expect(getKeyAlias(12345)).toBe('12345_HSM_KEY');
        });

        it('should handle different account IDs', () => {
            // Given various account IDs including edge cases like 0
            // When generating key aliases
            // Then each alias should be unique per account to prevent key collisions across different users on the same device
            expect(getKeyAlias(0)).toBe('0_HSM_KEY');
            expect(getKeyAlias(999999)).toBe('999999_HSM_KEY');
        });
    });

    describe('mapAuthTypeNumber', () => {
        it('should return undefined for undefined input', () => {
            // Given an undefined auth type number, which occurs when the biometric library does not report an auth type
            // When mapping the auth type number
            // Then undefined should be returned because there is no auth type to map
            expect(mapAuthTypeNumber(undefined)).toBeUndefined();
        });

        it('should return undefined for unmapped number', () => {
            // Given an auth type number that does not correspond to any known biometric method
            // When mapping the auth type number
            // Then undefined should be returned to avoid misrepresenting an unknown authentication method
            expect(mapAuthTypeNumber(99)).toBeUndefined();
        });

        it('should map -1 to Unknown', () => {
            // Given auth type number -1
            // When mapping the auth type number
            // Then it should resolve to the Unknown auth type, because the method could not be determined, but the authentication was successful
            const result = mapAuthTypeNumber(-1);
            expect(result).toEqual({
                code: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.UNKNOWN.CODE,
                name: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.UNKNOWN.NAME,
                marqetaValue: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.UNKNOWN.MARQETA_VALUE,
            });
        });

        it('should map 0 to None', () => {
            // Given auth type number 0, indicating no biometric authentication was used
            // When mapping the auth type number
            // Then it should resolve to "None" so we can distinguish unauthenticated from authenticated flows
            const result = mapAuthTypeNumber(0);
            expect(result?.name).toBe('None');
        });

        it('should map 1 to Credentials', () => {
            // Given auth type number 1, indicating device credential (PIN/password) was used instead of biometrics
            // When mapping the auth type number
            // Then it should resolve to "Credentials" to accurately report the fallback authentication method
            const result = mapAuthTypeNumber(1);
            expect(result?.name).toBe('Credentials');
        });

        it('should map 2 to Biometrics', () => {
            // Given auth type number 2, indicating a generic biometric method was used (common on Android)
            // When mapping the auth type number
            // Then it should resolve to "Biometrics" as the platform does not distinguish the specific biometric type
            const result = mapAuthTypeNumber(2);
            expect(result?.name).toBe('Biometrics');
        });

        it('should map 3 to Face ID', () => {
            // Given auth type number 3, indicating Apple Face ID was used
            // When mapping the auth type number
            // Then it should resolve to "Face ID"
            const result = mapAuthTypeNumber(3);
            expect(result?.name).toBe('Face ID');
        });

        it('should map 4 to Touch ID', () => {
            // Given auth type number 4, indicating Apple Touch ID was used
            // When mapping the auth type number
            // Then it should resolve to "Touch ID"
            const result = mapAuthTypeNumber(4);
            expect(result?.name).toBe('Touch ID');
        });

        it('should map 5 to Optic ID', () => {
            // Given auth type number 5, indicating Apple Optic ID (Vision Pro) was used
            // When mapping the auth type number
            // Then it should resolve to "Optic ID"
            const result = mapAuthTypeNumber(5);
            expect(result?.name).toBe('Optic ID');
        });
    });

    describe('mapSignErrorCode', () => {
        it('should return undefined for undefined input', () => {
            // Given no error code was provided, which happens when the sign operation succeeds
            // When mapping the error code
            // Then undefined should be returned because there is no error to classify
            expect(mapSignErrorCode(undefined)).toBeUndefined();
        });

        it('should return CANCELED for cancel-related error codes', () => {
            // Given various error code strings that indicate the user canceled the biometric prompt
            // When mapping the error codes
            // Then all cancel variants should resolve to CANCELED so the UI can show a consistent cancellation message regardless of platform-specific error strings
            expect(mapSignErrorCode('UserCancel')).toBe(VALUES.REASON.EXPO.CANCELED);
            expect(mapSignErrorCode('CANCELED')).toBe(VALUES.REASON.EXPO.CANCELED);
            expect(mapSignErrorCode('user_cancel')).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return NOT_SUPPORTED for "not available" error codes', () => {
            // Given error codes indicating biometrics are not available on the device
            // When mapping the error codes
            // Then they should resolve to NOT_SUPPORTED so the app can guide the user to enable biometrics or use an alternative method
            expect(mapSignErrorCode('Biometrics not available')).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
            expect(mapSignErrorCode('NOT AVAILABLE')).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
        });

        it('should return GENERIC for other error codes', () => {
            // Given an error code that does not match any known cancel or availability pattern
            // When mapping the error code
            // Then it should fall back to GENERIC so the error is still surfaced to the user with a general error message
            expect(mapSignErrorCode('some_unknown_error')).toBe(VALUES.REASON.EXPO.GENERIC);
        });
    });

    describe('mapLibraryError', () => {
        it('should return CANCELED for Error with cancel message', () => {
            // Given an Error object whose message contains "cancel", thrown by the biometric library when the user dismisses the prompt
            // When mapping the library error
            // Then it should resolve to CANCELED so the app treats thrown errors the same as error-code-based cancellations
            expect(mapLibraryError(new Error('User canceled the operation'))).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return CANCELED for string with cancel', () => {
            // Given a plain string error containing "cancel", which some library versions throw instead of Error objects
            // When mapping the library error
            // Then it should resolve to CANCELED regardless of the error type to handle inconsistent library error formats
            expect(mapLibraryError('Canceled by user')).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return undefined for non-cancel errors', () => {
            // Given an Error object with a message that does not indicate cancellation
            // When mapping the library error
            // Then undefined should be returned because the error does not match a known cancellation pattern and needs separate handling
            expect(mapLibraryError(new Error('Network error'))).toBeUndefined();
        });

        it('should return undefined for non-cancel strings', () => {
            // Given a plain string error that does not contain "cancel"
            // When mapping the library error
            // Then undefined should be returned because only cancellation errors have special handling in this mapper
            expect(mapLibraryError('timeout')).toBeUndefined();
        });
    });

    describe('buildSigningData', () => {
        const rpId = 'example.com';
        const challenge = 'test-challenge-123';
        // 32 bytes of 0xAA, base64-encoded
        const fakeRpIdHash = Buffer.alloc(32, 0xaa).toString('base64');
        // 32 bytes of 0xBB, base64-encoded
        const fakeClientDataHash = Buffer.alloc(32, 0xbb).toString('base64');

        beforeEach(() => {
            mockSha256.mockReset();
            mockSha256.mockImplementation((input: string) => {
                if (input === rpId) {
                    return Promise.resolve({hash: fakeRpIdHash});
                }
                return Promise.resolve({hash: fakeClientDataHash});
            });
        });

        it('should return authenticatorData with correct structure (37 bytes: 32 rpIdHash + 1 flags + 4 signCount)', async () => {
            // Given a valid rpId and challenge
            // When building signing data
            // Then authenticatorData should be exactly 37 bytes: rpIdHash(32) || flags(1) || signCount(4)
            const result = await buildSigningData(rpId, challenge);
            expect(result.authenticatorData.length).toBe(37);
        });

        it('should set flags byte to 0x05 (UP | UV)', async () => {
            // Given a valid rpId and challenge
            // When building signing data
            // Then the flags byte (index 32) should be 0x05 to indicate User Present and User Verified
            const result = await buildSigningData(rpId, challenge);
            expect(result.authenticatorData[32]).toBe(0x05);
        });

        it('should set signCount to 4 zero bytes', async () => {
            // Given a valid rpId and challenge
            // When building signing data
            // Then signCount bytes (indices 33-36) should all be zero as we don't track sign counts
            const result = await buildSigningData(rpId, challenge);
            expect(result.authenticatorData.slice(33, 37)).toEqual(Buffer.alloc(4));
        });

        it('should embed rpIdHash as the first 32 bytes of authenticatorData', async () => {
            // Given a known rpId hash
            // When building signing data
            // Then the first 32 bytes of authenticatorData should match the sha256 of rpId
            const result = await buildSigningData(rpId, challenge);
            expect(result.authenticatorData.slice(0, 32)).toEqual(Buffer.alloc(32, 0xaa));
        });

        it('should return clientDataJSON as stringified JSON containing the challenge', async () => {
            // Given a challenge string
            // When building signing data
            // Then clientDataJSON should be a JSON string with the challenge field
            const result = await buildSigningData(rpId, challenge);
            expect(result.clientDataJSON).toBe(JSON.stringify({challenge}));
        });

        it('should return dataToSignB64 as base64 of authenticatorData || clientDataHash', async () => {
            // Given known hashes for rpId and clientDataJSON
            // When building signing data
            // Then dataToSignB64 should be base64(authenticatorData || sha256(clientDataJSON))
            const result = await buildSigningData(rpId, challenge);
            const expectedDataToSign = Buffer.concat([result.authenticatorData, Buffer.alloc(32, 0xbb)]);
            expect(result.dataToSignB64).toBe(expectedDataToSign.toString('base64'));
        });

        it('should call sha256 with rpId and clientDataJSON', async () => {
            // Given rpId and challenge inputs
            // When building signing data
            // Then sha256 should be called twice: once for rpId and once for the clientDataJSON string
            await buildSigningData(rpId, challenge);
            expect(mockSha256).toHaveBeenCalledTimes(2);
            expect(mockSha256).toHaveBeenCalledWith(rpId);
            expect(mockSha256).toHaveBeenCalledWith(JSON.stringify({challenge}));
        });
    });
});
