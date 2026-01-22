import {SECURE_STORE_METHODS, SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';

describe('MultifactorAuthentication Biometrics SecureStore (native)', () => {
    it('exposes stable AUTH_TYPE mapping', () => {
        expect(SECURE_STORE_VALUES.AUTH_TYPE.UNKNOWN.NAME).toBe('Unknown');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.NONE.NAME).toBe('None');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.CREDENTIALS.NAME).toBe('Credentials');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.BIOMETRICS.NAME).toBe('Biometrics');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.FACE_ID.NAME).toBe('FaceID');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.TOUCH_ID.NAME).toBe('TouchID');
        expect(SECURE_STORE_VALUES.AUTH_TYPE.OPTIC_ID.NAME).toBe('OpticID');
    });

    it('exposes wrapper methods as functions', () => {
        expect(typeof SECURE_STORE_METHODS.canUseBiometricAuthentication).toBe('function');
        expect(typeof SECURE_STORE_METHODS.canUseDeviceCredentialsAuthentication).toBe('function');
        expect(typeof SECURE_STORE_METHODS.getItemAsync).toBe('function');
        expect(typeof SECURE_STORE_METHODS.setItemAsync).toBe('function');
        expect(typeof SECURE_STORE_METHODS.deleteItemAsync).toBe('function');
    });
});
