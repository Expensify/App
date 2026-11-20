import isNativeOnfidoPermissionError, {getNativeOnfidoErrorType} from '@libs/isNativeOnfidoPermissionError';

import CONST from '@src/CONST';

describe('isNativeOnfidoPermissionError', () => {
    it('detects a denied camera as iOS sends it', () => {
        // Given the error iOS sends when the camera is denied: the type is an encoded Swift enum case and there is no category
        const error = {type: {cameraPermissionDenied: {}}, message: 'Flow error due to camera permission being declined at app-level'};

        // When it is checked
        const isPermissionError = isNativeOnfidoPermissionError(error);

        // Then it counts as a permission error, so the user is offered the Settings alert instead of a generic error
        expect(isPermissionError).toBe(true);
    });

    it('detects a denied microphone as iOS sends it', () => {
        // Given the iOS error for a denied microphone, which the face video step needs
        const error = {type: {microphonePermissionDenied: {}}};

        // When it is checked
        const isPermissionError = isNativeOnfidoPermissionError(error);

        // Then it counts as a permission error too
        expect(isPermissionError).toBe(true);
    });

    it('detects a permission error with a string type or a category', () => {
        // Given errors in the shape the SDK's TypeScript types describe, in case native starts sending them
        const errorWithType = {type: 'PermissionsUnavailable'};
        const errorWithCategory = {type: 'Something', category: CONST.ONFIDO.NATIVE_ERROR_CATEGORY.PERMISSIONS};

        // When they are checked
        const results = [isNativeOnfidoPermissionError(errorWithType), isNativeOnfidoPermissionError(errorWithCategory)];

        // Then both count as permission errors, so the check keeps working if Entrust fixes the encoding
        expect(results).toEqual([true, true]);
    });

    it('does not treat other errors as permission errors', () => {
        // Given an expired token, as iOS and Android send it
        const iosError = {type: {expiredToken: {}}};
        const androidError = {type: 'ExpiredToken'};

        // When they are checked
        const results = [isNativeOnfidoPermissionError(iosError), isNativeOnfidoPermissionError(androidError)];

        // Then neither counts as a permission error, so the user isn't sent to Settings for an unrelated problem
        expect(results).toEqual([false, false]);
    });
});

describe('getNativeOnfidoErrorType', () => {
    it('reads the type from either encoding', () => {
        // Given the error type as Android sends it, as iOS sends it, and missing
        const types = ['ExpiredToken', {cameraPermissionDenied: {}}, undefined];

        // When each is read
        const results = types.map((type) => getNativeOnfidoErrorType(type));

        // Then the logs get a readable type name for both platforms
        expect(results).toEqual(['ExpiredToken', 'cameraPermissionDenied', undefined]);
    });
});
