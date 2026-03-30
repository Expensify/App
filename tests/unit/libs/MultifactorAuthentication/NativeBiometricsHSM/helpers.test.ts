import {getKeyAlias, mapAuthTypeNumber, mapLibraryError, mapSignErrorCode} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true}),
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
});
