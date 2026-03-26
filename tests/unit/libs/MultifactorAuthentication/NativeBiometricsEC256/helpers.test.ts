import {base64ToBase64url, getKeyAlias, mapAuthTypeNumber, mapBiometryTypeToAuthType, mapLibraryError, mapSignErrorCode} from '@libs/MultifactorAuthentication/NativeBiometricsEC256/helpers';
import NATIVE_BIOMETRICS_EC256_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsEC256/VALUES';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true}),
}));

describe('NativeBiometricsEC256 helpers', () => {
    describe('base64ToBase64url', () => {
        it('should replace + with -', () => {
            expect(base64ToBase64url('abc+def')).toBe('abc-def');
        });

        it('should replace / with _', () => {
            expect(base64ToBase64url('abc/def')).toBe('abc_def');
        });

        it('should strip trailing = padding', () => {
            expect(base64ToBase64url('abc==')).toBe('abc');
            expect(base64ToBase64url('abcd=')).toBe('abcd');
        });

        it('should handle all replacements together', () => {
            expect(base64ToBase64url('abc+def/ghi==')).toBe('abc-def_ghi');
        });

        it('should leave already-safe strings unchanged', () => {
            expect(base64ToBase64url('abcdef')).toBe('abcdef');
        });
    });

    describe('getKeyAlias', () => {
        it('should build alias from accountID and EC256_KEY_SUFFIX', () => {
            expect(getKeyAlias(12345)).toBe('12345_EC256_KEY');
        });

        it('should handle different account IDs', () => {
            expect(getKeyAlias(0)).toBe('0_EC256_KEY');
            expect(getKeyAlias(999999)).toBe('999999_EC256_KEY');
        });
    });

    describe('mapAuthTypeNumber', () => {
        it('should return undefined for undefined input', () => {
            expect(mapAuthTypeNumber(undefined)).toBeUndefined();
        });

        it('should return undefined for unmapped number', () => {
            expect(mapAuthTypeNumber(99)).toBeUndefined();
        });

        it('should map -1 to Unknown', () => {
            const result = mapAuthTypeNumber(-1);
            expect(result).toEqual({
                code: NATIVE_BIOMETRICS_EC256_VALUES.AUTH_TYPE.UNKNOWN.CODE,
                name: NATIVE_BIOMETRICS_EC256_VALUES.AUTH_TYPE.UNKNOWN.NAME,
                marqetaValue: NATIVE_BIOMETRICS_EC256_VALUES.AUTH_TYPE.UNKNOWN.MARQETA_VALUE,
            });
        });

        it('should map 0 to None', () => {
            const result = mapAuthTypeNumber(0);
            expect(result?.name).toBe('None');
        });

        it('should map 1 to Credentials', () => {
            const result = mapAuthTypeNumber(1);
            expect(result?.name).toBe('Credentials');
        });

        it('should map 2 to Biometrics', () => {
            const result = mapAuthTypeNumber(2);
            expect(result?.name).toBe('Biometrics');
        });

        it('should map 3 to Face ID', () => {
            const result = mapAuthTypeNumber(3);
            expect(result?.name).toBe('Face ID');
        });

        it('should map 4 to Touch ID', () => {
            const result = mapAuthTypeNumber(4);
            expect(result?.name).toBe('Touch ID');
        });

        it('should map 5 to Optic ID', () => {
            const result = mapAuthTypeNumber(5);
            expect(result?.name).toBe('Optic ID');
        });
    });

    describe('mapBiometryTypeToAuthType', () => {
        it('should map FaceID string to Face ID auth type', () => {
            const result = mapBiometryTypeToAuthType('FaceID');
            expect(result?.name).toBe('Face ID');
        });

        it('should map TouchID string to Touch ID auth type', () => {
            const result = mapBiometryTypeToAuthType('TouchID');
            expect(result?.name).toBe('Touch ID');
        });

        it('should map Biometrics string to Biometrics auth type', () => {
            const result = mapBiometryTypeToAuthType('Biometrics');
            expect(result?.name).toBe('Biometrics');
        });

        it('should map OpticID string to Optic ID auth type', () => {
            const result = mapBiometryTypeToAuthType('OpticID');
            expect(result?.name).toBe('Optic ID');
        });

        it('should fall back to Credentials when biometryType is unknown but device is secure', () => {
            const result = mapBiometryTypeToAuthType(undefined, true);
            expect(result?.name).toBe('Credentials');
        });

        it('should return undefined when biometryType is unknown and device is not secure', () => {
            expect(mapBiometryTypeToAuthType(undefined, false)).toBeUndefined();
            expect(mapBiometryTypeToAuthType(undefined)).toBeUndefined();
        });

        it('should return undefined for unrecognized biometryType when device is not secure', () => {
            expect(mapBiometryTypeToAuthType('SomeNewType', false)).toBeUndefined();
        });
    });

    describe('mapSignErrorCode', () => {
        it('should return undefined for undefined input', () => {
            expect(mapSignErrorCode(undefined)).toBeUndefined();
        });

        it('should return CANCELED for cancel-related error codes', () => {
            expect(mapSignErrorCode('UserCancel')).toBe(VALUES.REASON.EXPO.CANCELED);
            expect(mapSignErrorCode('CANCELED')).toBe(VALUES.REASON.EXPO.CANCELED);
            expect(mapSignErrorCode('user_cancel')).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return NOT_SUPPORTED for "not available" error codes', () => {
            expect(mapSignErrorCode('Biometrics not available')).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
            expect(mapSignErrorCode('NOT AVAILABLE')).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
        });

        it('should return GENERIC for other error codes', () => {
            expect(mapSignErrorCode('some_unknown_error')).toBe(VALUES.REASON.EXPO.GENERIC);
        });
    });

    describe('mapLibraryError', () => {
        it('should return CANCELED for Error with cancel message', () => {
            expect(mapLibraryError(new Error('User canceled the operation'))).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return CANCELED for string with cancel', () => {
            expect(mapLibraryError('Canceled by user')).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should return undefined for non-cancel errors', () => {
            expect(mapLibraryError(new Error('Network error'))).toBeUndefined();
        });

        it('should return undefined for non-cancel strings', () => {
            expect(mapLibraryError('timeout')).toBeUndefined();
        });
    });
});
