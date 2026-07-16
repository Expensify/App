/**
 * This suite reads `window` at module scope, so it pins the jsdom environment
 * instead of relying on the project-wide testEnvironment setting.
 *
 * @jest-environment jsdom
 */
import type * as WebBiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations/index';

import CONST from '@src/CONST';

// jest-expo resolves the native variant by default, so load the web entry point explicitly.
const {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} = jest.requireActual<typeof WebBiometricsOperations>(
    '@components/MultifactorAuthentication/biometrics/operations/index.ts',
);

const originalPublicKeyCredentialDescriptor = Object.getOwnPropertyDescriptor(window, 'PublicKeyCredential');

function setWebAuthnSupport(isSupported: boolean) {
    if (!isSupported) {
        Reflect.deleteProperty(window, 'PublicKeyCredential');
        return;
    }
    Object.defineProperty(window, 'PublicKeyCredential', {configurable: true, value: class PublicKeyCredential {}});
}

describe('biometrics operations (web)', () => {
    afterEach(() => {
        if (originalPublicKeyCredentialDescriptor) {
            Object.defineProperty(window, 'PublicKeyCredential', originalPublicKeyCredentialDescriptor);
        } else {
            Reflect.deleteProperty(window, 'PublicKeyCredential');
        }
    });

    it('reports PASSKEYS as the device verification type', () => {
        expect(deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS);
    });

    it('reports the unsupported authentication type failure reason', () => {
        expect(deviceCheckFailureReason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED);
    });

    it.each([
        {isSupported: true, expected: true},
        {isSupported: false, expected: false},
    ])('returns $expected when WebAuthn support is $isSupported', async ({isSupported, expected}) => {
        setWebAuthnSupport(isSupported);

        await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(expected);
    });
});
