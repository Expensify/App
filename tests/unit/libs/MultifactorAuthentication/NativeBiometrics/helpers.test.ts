import decodeExpoMessage from '@libs/MultifactorAuthentication/NativeBiometrics/helpers';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

describe('NativeBiometrics helpers', () => {
    describe('decodeExpoMessage', () => {
        it('should decode user canceled error', () => {
            const result = decodeExpoMessage('User canceled the action. Caused by: canceled');

            expect(result).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should decode authentication in progress error', () => {
            const result = decodeExpoMessage('Authentication already in progress. Caused by: in progress');

            expect(result).toBe(VALUES.REASON.EXPO.IN_PROGRESS);
        });

        it('should decode not in foreground error', () => {
            const result = decodeExpoMessage('App not in foreground. Caused by: not in the foreground');

            expect(result).toBe(VALUES.REASON.EXPO.NOT_IN_FOREGROUND);
        });

        it('should decode key exists error', () => {
            const result = decodeExpoMessage('This key already exists. Caused by: already exists');

            expect(result).toBe(VALUES.REASON.EXPO.KEY_EXISTS);
        });

        it('should decode no authentication method error', () => {
            const result = decodeExpoMessage('No authentication method available');

            expect(result).toBe(VALUES.REASON.EXPO.NO_METHOD_AVAILABLE);
        });

        it('should decode old android error', () => {
            const result = decodeExpoMessage('NoSuchMethodError: Cannot find method');

            expect(result).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
        });

        it('should return generic error for unknown error', () => {
            const result = decodeExpoMessage('Unknown error message');

            expect(result).toBe(VALUES.REASON.EXPO.GENERIC);
        });

        it('should handle error object', () => {
            const errorObj = new Error('canceled');
            const result = decodeExpoMessage(errorObj);

            expect(result).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should use fallback when error is generic and fallback is provided', () => {
            const result = decodeExpoMessage('Unknown error', VALUES.REASON.BACKEND.REGISTRATION_REQUIRED);

            expect(result).toBe(VALUES.REASON.BACKEND.REGISTRATION_REQUIRED);
        });
    });
});
