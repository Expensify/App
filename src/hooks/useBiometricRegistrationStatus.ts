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
    localPublicKey: string | undefined;
    isCurrentDeviceRegistered: boolean;
    otherDeviceCount: number;
    registrationStatus: RegistrationStatus;
};

function useBiometricRegistrationStatus(): BiometricRegistrationStatus {
    const {getLocalPublicKey, serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useNativeBiometrics();
    const [localPublicKey, setLocalPublicKey] = useState<string | undefined>();

    useEffect(() => {
        let cancelled = false;
        getLocalPublicKey().then((key) => {
            if (cancelled) {
                return;
            }
            setLocalPublicKey(key);
        });
        return () => {
            cancelled = true;
        };
    }, [getLocalPublicKey]);

    const isCurrentDeviceRegistered = !!localPublicKey && serverKnownCredentialIDs.includes(localPublicKey);
    const otherDeviceCount = serverKnownCredentialIDs.length - (isCurrentDeviceRegistered ? 1 : 0);

    let registrationStatus: RegistrationStatus;
    if (!haveCredentialsEverBeenConfigured) {
        registrationStatus = REGISTRATION_STATUS.NEVER_REGISTERED;
    } else if (serverKnownCredentialIDs.length === 0) {
        registrationStatus = REGISTRATION_STATUS.NOT_REGISTERED;
    } else if (isCurrentDeviceRegistered) {
        registrationStatus = REGISTRATION_STATUS.REGISTERED_THIS_DEVICE;
    } else {
        registrationStatus = REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE;
    }

    return {
        localPublicKey,
        isCurrentDeviceRegistered,
        otherDeviceCount,
        registrationStatus,
    };
}

export {REGISTRATION_STATUS};
export type {RegistrationStatus};
export default useBiometricRegistrationStatus;
