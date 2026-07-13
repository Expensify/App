import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import type * as BiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations';

import CONST from '@src/CONST';

const mockDoesDeviceSupportAuthenticationMethod = jest.fn<Promise<boolean>, []>();

// jest-expo resolves the platform-specific operations module to its native variant, so the platform
// verification type in these tests is BIOMETRICS_HSM. Allowing only PASSKEYS therefore fails the
// allowed-methods gate, while allowing BIOMETRICS_HSM reaches the mocked device support check.
jest.mock('@components/MultifactorAuthentication/biometrics/operations', () => ({
    ...jest.requireActual<typeof BiometricsOperations>('@components/MultifactorAuthentication/biometrics/operations'),
    doesDeviceSupportAuthenticationMethod: () => mockDoesDeviceSupportAuthenticationMethod(),
}));

const TYPE = CONST.MULTIFACTOR_AUTHENTICATION.TYPE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

describe('checkDeviceEligibility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDoesDeviceSupportAuthenticationMethod.mockResolvedValue(true);
    });

    it('returns a failure without checking device support when the platform method is not allowed', async () => {
        const result = await checkDeviceEligibility([TYPE.PASSKEYS]);

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected device eligibility to fail');
        }
        expect(result.error.reason).toBe(REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED);
        expect(mockDoesDeviceSupportAuthenticationMethod).not.toHaveBeenCalled();
    });

    it('returns success when the platform method is allowed and supported', async () => {
        await expect(checkDeviceEligibility([TYPE.BIOMETRICS_HSM])).resolves.toEqual({success: true});
    });

    it('uses the platform failure reason when the allowed method is not supported', async () => {
        mockDoesDeviceSupportAuthenticationMethod.mockResolvedValue(false);

        const result = await checkDeviceEligibility([TYPE.BIOMETRICS_HSM]);

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected device eligibility to fail');
        }
        expect(result.error.reason).toBe(REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED);
    });

    it('propagates an unexpected platform error', async () => {
        mockDoesDeviceSupportAuthenticationMethod.mockRejectedValue(new Error('sensor query exploded'));

        await expect(checkDeviceEligibility([TYPE.BIOMETRICS_HSM])).rejects.toThrow('sensor query exploded');
    });
});
