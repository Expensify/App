/**
 * Hook that derives the current device's biometric registration status by combining the local public key with
 * the server-known credential list.
 */
import {useEffect, useState} from 'react';
import useNativeBiometrics from '@components/MultifactorAuthentication/Context/useNativeBiometrics';

const REGISTRATION_STATUS = {
    NEVER_REGISTERED: 'never',
    NOT_REGISTERED: 'not_registered',
    REGISTERED_OTHER_DEVICE: 'other_device',
    REGISTERED_THIS_DEVICE: 'this_device',
} as const;

type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

type BiometricRegistrationStatus = {
    /** Public key stored locally on this device, or undefined if none exists */
    localPublicKey: string | undefined;

    /** Whether this device's local key is registered with the server */
    isCurrentDeviceRegistered: boolean;

    /** Total number of devices with registered biometric credentials */
    totalDeviceCount: number;

    /** Number of registered devices excluding the current one */
    otherDeviceCount: number;

    /** High-level registration status summarizing the device's biometric state */
    registrationStatus: RegistrationStatus;
};

function useBiometricRegistrationStatus(): BiometricRegistrationStatus {
    const {getLocalPublicKey, serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useNativeBiometrics();
    const [localPublicKey, setLocalPublicKey] = useState<string | undefined>();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const key = await getLocalPublicKey();
                if (cancelled) {
                    return;
                }
                setLocalPublicKey(key);
            } catch {
                if (cancelled) {
                    return;
                }
                setLocalPublicKey(undefined);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [getLocalPublicKey, serverKnownCredentialIDs]);

    const isCurrentDeviceRegistered = !!localPublicKey && serverKnownCredentialIDs.includes(localPublicKey);
    const totalDeviceCount = serverKnownCredentialIDs.length;
    const otherDeviceCount = totalDeviceCount - (isCurrentDeviceRegistered ? 1 : 0);

    let registrationStatus: RegistrationStatus;
    if (!haveCredentialsEverBeenConfigured) {
        registrationStatus = REGISTRATION_STATUS.NEVER_REGISTERED;
    } else if (totalDeviceCount === 0) {
        registrationStatus = REGISTRATION_STATUS.NOT_REGISTERED;
    } else if (isCurrentDeviceRegistered) {
        registrationStatus = REGISTRATION_STATUS.REGISTERED_THIS_DEVICE;
    } else {
        registrationStatus = REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE;
    }

    return {
        localPublicKey,
        isCurrentDeviceRegistered,
        totalDeviceCount,
        otherDeviceCount,
        registrationStatus,
    };
}

export {REGISTRATION_STATUS};
export type {RegistrationStatus};
export default useBiometricRegistrationStatus;
