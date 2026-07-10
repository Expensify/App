import createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import createInitEvent from 'tests/utils/mfa/flowFixtures';
import {createActor, toPromise} from 'xstate';

// jest-expo defaults to the ios platform, so the actor under test resolves the native operations
// module (operations/index.native.ts): the platform method is BIOMETRICS_HSM, the capability check
// reads the HSM biometric sensor, and its failure reason is the missing enrollment.
const mockIsSensorAvailable = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
}));

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

// The BiometricsTest scenario config allows both BIOMETRICS_HSM and PASSKEYS, so it passes the
// allowed-methods gate on this platform without any override.
const allowingScenario = createInitEvent().scenario;

function runValidateDevice(scenario: ValidateDeviceInput['scenario']): Promise<MFAResult> {
    const actor = createActor(createActors().validateDevice, {input: {scenario}});
    const output = toPromise(actor);
    actor.start();
    return output;
}

describe('validateDevice actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSensorAvailable.mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true});
    });

    it('should resolve successfully when the scenario allows the platform method and the device can perform it', async () => {
        // Given a scenario that allows BIOMETRICS_HSM and a device with an enrolled, secured sensor
        // When the device check runs
        // Then it should resolve as a successful result so the machine can continue the flow
        await expect(runValidateDevice(allowingScenario)).resolves.toEqual({success: true});
    });

    it('should refuse before the capability check when no allowed method matches the platform method', async () => {
        // Given a flow without a scenario config, which allows no authentication methods. Every real
        // scenario config allows the platform method by construction, so the empty list is the only
        // buildable input that fails the allowed-methods gate.
        // When the device check runs
        const result = await runValidateDevice(undefined);

        // Then it should resolve as a failed result carrying the not-supported reason, because a
        // refusal is an expected outcome that the machine routes to the failure screen
        expect(result).toEqual({
            success: false,
            error: {reason: REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED, message: 'Authentication method not allowed (deviceVerificationType: BIOMETRICS_HSM, allowedMethods: )'},
        });
        // Then it should not have queried the sensor, because the allowed-methods gate comes first
        expect(mockIsSensorAvailable).not.toHaveBeenCalled();
    });

    it('should refuse with the platform failure reason when the device cannot perform the allowed method', async () => {
        // Given an allowed method but a device with no biometric sensor and no secure lock screen
        mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: false});

        // When the device check runs
        // Then it should resolve as a failed result with the enrollment reason the native platform reports
        await expect(runValidateDevice(allowingScenario)).resolves.toEqual({
            success: false,
            error: {reason: REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED, message: 'Device check failed (deviceVerificationType: BIOMETRICS_HSM)'},
        });
    });

    it('should reject when the platform check itself throws', async () => {
        // Given a platform sensor query that throws instead of answering
        mockIsSensorAvailable.mockRejectedValue(new Error('sensor query exploded'));

        // When the device check runs
        // Then it should reject, because expected refusals travel as failed results and a rejection is
        // reserved for the machine's onError unhandled-exception path
        await expect(runValidateDevice(allowingScenario)).rejects.toThrow('sensor query exploded');
    });
});
