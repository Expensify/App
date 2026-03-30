import {base64ToBase64url, getKeyAlias, mapAuthTypeNumber, mapBiometryTypeToAuthType, mapLibraryError, mapSignErrorCode} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true}),
}));

describe('NativeBiometricsHSM helpers', () => {
    describe('base64ToBase64url', () => {
        it('should replace + with -', () => {
            // Given a base64 string containing '+' characters, which are not URL-safe
            // When converting to base64url format
            // Then '+' should be replaced with '-' because base64url encoding requires URL-safe characters for use in credential IDs
            expect(base64ToBase64url('abc+def')).toBe('abc-def');
        });

        it('should replace / with _', () => {
            // Given a base64 string containing '/' characters, which are not URL-safe
            // When converting to base64url format
            // Then '/' should be replaced with '_' because base64url encoding requires URL-safe characters for use in credential IDs
            expect(base64ToBase64url('abc/def')).toBe('abc_def');
        });

        it('should strip trailing = padding', () => {
            // Given a base64 string with trailing '=' padding characters
            // When converting to base64url format
            // Then padding should be stripped because base64url omits padding per RFC 4648 §5
            expect(base64ToBase64url('abc==')).toBe('abc');
            expect(base64ToBase64url('abcd=')).toBe('abcd');
        });

        it('should handle all replacements together', () => {
            // Given a base64 string with '+', '/', and '=' characters combined
            // When converting to base64url format
            // Then all unsafe characters should be replaced in a single pass to produce a valid base64url credential ID
            expect(base64ToBase64url('abc+def/ghi==')).toBe('abc-def_ghi');
        });

        it('should leave already-safe strings unchanged', () => {
            // Given a base64 string that already contains only URL-safe characters
            // When converting to base64url format
            // Then the string should remain unchanged because no substitution is needed
            expect(base64ToBase64url('abcdef')).toBe('abcdef');
        });
    });

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

    describe('mapBiometryTypeToAuthType', () => {
        it('should map FaceID string to Face ID auth type', () => {
            // Given the biometric sensor reports "FaceID" as the available biometry type (iOS devices with Face ID)
            // When mapping the biometry type string to an auth type
            // Then it should resolve to "Face ID" for accurate biometric method reporting
            const result = mapBiometryTypeToAuthType('FaceID');
            expect(result?.name).toBe('Face ID');
        });

        it('should map TouchID string to Touch ID auth type', () => {
            // Given the biometric sensor reports "TouchID" as the available biometry type (older iOS devices)
            // When mapping the biometry type string to an auth type
            // Then it should resolve to "Touch ID" for accurate biometric method reporting
            const result = mapBiometryTypeToAuthType('TouchID');
            expect(result?.name).toBe('Touch ID');
        });

        it('should map Biometrics string to Biometrics auth type', () => {
            // Given the biometric sensor reports "Biometrics" as the available type (Android devices)
            // When mapping the biometry type string to an auth type
            // Then it should resolve to "Biometrics" since Android does not distinguish specific biometric hardware
            const result = mapBiometryTypeToAuthType('Biometrics');
            expect(result?.name).toBe('Biometrics');
        });

        it('should map OpticID string to Optic ID auth type', () => {
            // Given the biometric sensor reports "OpticID" as the available biometry type (Apple Vision Pro)
            // When mapping the biometry type string to an auth type
            // Then it should resolve to "Optic ID" for accurate biometric method reporting
            const result = mapBiometryTypeToAuthType('OpticID');
            expect(result?.name).toBe('Optic ID');
        });

        it('should fall back to Credentials when biometryType is unknown but device is secure', () => {
            // Given an unknown biometry type but the device has a secure lock screen
            // When mapping the biometry type to an auth type
            // Then it should fall back to "Credentials" because the device can still verify the user via PIN/password
            const result = mapBiometryTypeToAuthType(undefined, true);
            expect(result?.name).toBe('Credentials');
        });

        it('should return undefined when biometryType is unknown and device is not secure', () => {
            // Given an unknown biometry type and the device has no secure lock screen
            // When mapping the biometry type to an auth type
            // Then undefined should be returned because no verification method is available on this device
            expect(mapBiometryTypeToAuthType(undefined, false)).toBeUndefined();
            expect(mapBiometryTypeToAuthType(undefined)).toBeUndefined();
        });

        it('should return undefined for unrecognized biometryType when device is not secure', () => {
            // Given an unrecognized biometry type string and the device has no secure lock screen
            // When mapping the biometry type to an auth type
            // Then undefined should be returned because neither the biometric type nor a fallback is available
            expect(mapBiometryTypeToAuthType('SomeNewType', false)).toBeUndefined();
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
