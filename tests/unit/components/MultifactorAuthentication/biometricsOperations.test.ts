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
        expect(deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM);
    });

    it('should report the enrollment failure reason for an unsupported device', () => {
        expect(deviceCheckFailureReason).toBe(VALUES.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED);
    });

    describe('doesDeviceSupportAuthenticationMethod', () => {
        it('should return true when sensor is available', async () => {
            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return true when device is secure but no biometrics', async () => {
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: true});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return false when sensor unavailable and device not secure', async () => {
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: false});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(false);
        });
    });
});
