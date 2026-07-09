// jest-expo defaults to the ios platform, so this import resolves the native operations module
// (operations/index.native.ts), which checks the HSM biometric sensor.
import {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} from '@components/MultifactorAuthentication/biometrics/operations';

import VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';

const mockIsSensorAvailable = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
}));

describe('biometrics operations (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSensorAvailable.mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true});
    });

    it('should report BIOMETRICS_HSM as the device verification type', () => {
        // Given the native platform
        // When reading the platform's verification type
        // Then it should be BIOMETRICS_HSM so the MFA system can distinguish it from other verification methods
        expect(deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM);
    });

    it('should report the enrollment failure reason for an unsupported device', () => {
        // Given the native platform
        // When reading the platform's device check failure reason
        // Then it should point at missing enrollment because that is the only way a native device fails the check
        expect(deviceCheckFailureReason).toBe(VALUES.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED);
    });

    describe('doesDeviceSupportAuthenticationMethod', () => {
        it('should return true when sensor is available', async () => {
            // Given a device with a biometric sensor available (e.g., Face ID or Touch ID)
            // When checking device support for biometric authentication
            // Then it should return true because the device can perform biometric verification
            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return true when device is secure but no biometrics', async () => {
            // Given a device without biometric hardware but with a secure lock screen (PIN/password)
            // When checking device support for biometric authentication
            // Then it should return true because device credentials can serve as a fallback verification method
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: true});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return false when sensor unavailable and device not secure', async () => {
            // Given a device with no biometric sensor and no secure lock screen configured
            // When checking device support for biometric authentication
            // Then it should return false because there is no way to verify the user's identity on this device
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: false});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(false);
        });
    });
});
