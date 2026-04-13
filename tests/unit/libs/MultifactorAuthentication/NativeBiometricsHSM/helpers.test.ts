import {Buffer} from 'buffer';
import {buildSigningData, getKeyAlias, mapAuthTypeNumber, mapLibraryErrorToReason, mapSignErrorCodeToReason} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
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

    describe('mapSignErrorCodeToReason', () => {
        it('should return undefined for undefined input', () => {
            // Given no error code was provided, which happens when the sign operation succeeds
            // When mapping the error code
            // Then undefined should be returned because there is no error to classify
            expect(mapSignErrorCodeToReason(undefined)).toBeUndefined();
        });

        it('should return CANCELED for user cancel error codes', () => {
            // Given exact error code strings from the library indicating the user canceled the biometric prompt
            // When mapping the error codes
            // Then both iOS (USER_CANCEL) and Android (USER_CANCELED) variants should resolve to HSM.CANCELED
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCEL)).toBe(VALUES.REASON.HSM.CANCELED);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCELED)).toBe(VALUES.REASON.HSM.CANCELED);
        });

        it('should return CANCELED for system cancel error codes', () => {
            // Given exact error code strings indicating the system canceled authentication (e.g., app backgrounded)
            // When mapping the error codes
            // Then both iOS (SYSTEM_CANCEL) and Android (SYSTEM_CANCELED) variants should resolve to HSM.CANCELED
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SYSTEM_CANCEL)).toBe(VALUES.REASON.HSM.CANCELED);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SYSTEM_CANCELED)).toBe(VALUES.REASON.HSM.CANCELED);
        });

        it('should return NOT_AVAILABLE for biometric unavailability error codes', () => {
            // Given exact error codes indicating biometrics are not available on the device
            // When mapping the error codes
            // Then they should resolve to HSM.NOT_AVAILABLE so the app can guide the user to enable biometrics or use an alternative method
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_NOT_AVAILABLE)).toBe(VALUES.REASON.HSM.NOT_AVAILABLE);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_NOT_AVAILABLE)).toBe(VALUES.REASON.HSM.NOT_AVAILABLE);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_UNAVAILABLE)).toBe(VALUES.REASON.HSM.NOT_AVAILABLE);
        });

        it('should return LOCKOUT for temporary lockout error codes', () => {
            // Given exact error codes indicating temporary biometric lockout after too many failed attempts
            // When mapping the error codes
            // Then both iOS and Android variants should resolve to HSM.LOCKOUT
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_LOCKOUT)).toBe(VALUES.REASON.HSM.LOCKOUT);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_LOCKOUT)).toBe(VALUES.REASON.HSM.LOCKOUT);
        });

        it('should return LOCKOUT_PERMANENT for permanent lockout error codes', () => {
            // Given exact error codes indicating permanent biometric lockout requiring device credential to reset
            // When mapping the error codes
            // Then both iOS and Android variants should resolve to HSM.LOCKOUT_PERMANENT
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_LOCKOUT_PERMANENT)).toBe(VALUES.REASON.HSM.LOCKOUT_PERMANENT);
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_LOCKOUT_PERMANENT)).toBe(VALUES.REASON.HSM.LOCKOUT_PERMANENT);
        });

        it('should return SIGNATURE_FAILED for signature creation failure', () => {
            // Given the exact error code for signature creation failure
            // When mapping the error code
            // Then it should resolve to HSM.SIGNATURE_FAILED
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SIGNATURE_CREATION_FAILED)).toBe(VALUES.REASON.HSM.SIGNATURE_FAILED);
        });

        it('should return KEY_NOT_FOUND for key not found error code', () => {
            // Given the exact error code for when the signing key does not exist in the keystore
            // When mapping the error code
            // Then it should resolve to HSM.KEY_NOT_FOUND
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_NOT_FOUND)).toBe(VALUES.REASON.HSM.KEY_NOT_FOUND);
        });

        it('should return REGISTRATION_REQUIRED for key access failed error code', () => {
            // Given the exact error code for when the key cannot be accessed (e.g. biometric enrollment changed)
            // When mapping the error code
            // Then it should resolve to HSM.KEY_ACCESS_FAILED to trigger re-registration
            expect(mapSignErrorCodeToReason(NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ACCESS_FAILED)).toBe(VALUES.REASON.HSM.KEY_ACCESS_FAILED);
        });

        it('should return GENERIC for unrecognized error codes', () => {
            // Given an error code that does not match any known library error code constant
            // When mapping the error code
            // Then it should fall back to HSM.GENERIC so the error is still surfaced to the user with a general error message
            expect(mapSignErrorCodeToReason('some_unknown_error')).toBe(VALUES.REASON.HSM.GENERIC);
        });
    });

    describe('mapLibraryErrorToReason', () => {
        it('should return CANCELED for Error with USER_CANCEL code', () => {
            // Given an Error object with a code property matching the iOS user cancel error code
            // When mapping the library error
            // Then it should resolve to HSM.CANCELED based on the exact error code
            const error = Object.assign(new Error('User canceled authentication'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCEL});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.CANCELED);
        });

        it('should return CANCELED for Error with USER_CANCELED code', () => {
            // Given an Error object with a code property matching the Android user cancel error code
            // When mapping the library error
            // Then it should resolve to HSM.CANCELED based on the exact error code
            const error = Object.assign(new Error('User canceled the operation'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCELED});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.CANCELED);
        });

        it('should return KEY_CREATION_FAILED for Error with CREATE_KEYS_ERROR code', () => {
            // Given an Error object with a code property matching the key creation error code
            // When mapping the library error
            // Then it should resolve to HSM.KEY_CREATION_FAILED
            const error = Object.assign(new Error('Failed to create keys'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.CREATE_KEYS_ERROR});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.KEY_CREATION_FAILED);
        });

        it('should return KEY_CREATION_FAILED for Error with KEY_ALREADY_EXISTS code', () => {
            // Given an Error object with a code property matching the key already exists error code
            // When mapping the library error
            // Then it should resolve to HSM.KEY_CREATION_FAILED since the key creation operation failed
            const error = Object.assign(new Error('Key already exists'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ALREADY_EXISTS});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.KEY_CREATION_FAILED);
        });

        it('should return KEY_NOT_FOUND for Error with KEY_NOT_FOUND code', () => {
            // Given an Error object with a code property matching the key not found error code
            // When mapping the library error
            // Then it should resolve to HSM.KEY_NOT_FOUND
            const error = Object.assign(new Error('Cryptographic key not found'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_NOT_FOUND});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.KEY_NOT_FOUND);
        });

        it('should return REGISTRATION_REQUIRED for Error with KEY_ACCESS_FAILED code', () => {
            // Given an Error object with a code property matching the key access failed error code
            // When mapping the library error
            // Then it should resolve to HSM.KEY_ACCESS_FAILED to trigger re-registration
            const error = Object.assign(new Error('Failed to access cryptographic key'), {code: NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ACCESS_FAILED});
            expect(mapLibraryErrorToReason(error)).toBe(VALUES.REASON.HSM.KEY_ACCESS_FAILED);
        });

        it('should return undefined for Error without code property', () => {
            // Given an Error object without a code property (generic JS error, not from the library)
            // When mapping the library error
            // Then undefined should be returned because the error cannot be classified without a code
            expect(mapLibraryErrorToReason(new Error('Network error'))).toBeUndefined();
        });

        it('should return undefined for Error with unrecognized code', () => {
            // Given an Error object with a code property that does not match any known library error code
            // When mapping the library error
            // Then undefined should be returned so the caller can provide a fallback reason
            const error = Object.assign(new Error('Some error'), {code: 'UNKNOWN_CODE'});
            expect(mapLibraryErrorToReason(error)).toBeUndefined();
        });

        it('should return undefined for non-Error values', () => {
            // Given a plain string error (not an Error object, so no code property)
            // When mapping the library error
            // Then undefined should be returned because only Error objects with code properties are classified
            expect(mapLibraryErrorToReason('some string error')).toBeUndefined();
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
            expect(result.authenticatorData.subarray(33, 37)).toEqual(Buffer.alloc(4));
        });

        it('should embed rpIdHash as the first 32 bytes of authenticatorData', async () => {
            // Given a known rpId hash
            // When building signing data
            // Then the first 32 bytes of authenticatorData should match the sha256 of rpId
            const result = await buildSigningData(rpId, challenge);
            expect(result.authenticatorData.subarray(0, 32)).toEqual(Buffer.alloc(32, 0xaa));
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
