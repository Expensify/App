import {useEffect, useState} from 'react';
import {PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const REGISTRATION_STATUS = {
    NEVER_REGISTERED: 'never',
    NOT_REGISTERED: 'not_registered',
    REGISTERED_OTHER_DEVICE: 'other_device',
    REGISTERED_THIS_DEVICE: 'this_device',
} as const;

type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

type BiometricRegistrationStatus = {
    localPublicKey: string | null;
    isCurrentDeviceRegistered: boolean;
    otherDeviceCount: number;
    registrationStatus: RegistrationStatus;
    serverKeyIDs: string[] | undefined;
};

function useBiometricRegistrationStatus(): BiometricRegistrationStatus {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const accountID = currentUserPersonalDetails?.accountID;
    const serverKeyIDs = account?.multifactorAuthenticationPublicKeyIDs;

    const [localPublicKey, setLocalPublicKey] = useState<string | null>(null);

    useEffect(() => {
        if (!accountID) {
            return;
        }
        let cancelled = false;
        PublicKeyStore.get(accountID).then(({value}) => {
            if (cancelled) {
                return;
            }
            setLocalPublicKey(value ?? null);
        });
        return () => {
            cancelled = true;
        };
    }, [accountID, serverKeyIDs]);

    const isCurrentDeviceRegistered = !!localPublicKey && !!serverKeyIDs && serverKeyIDs.includes(localPublicKey);

    const otherDeviceCount = serverKeyIDs ? serverKeyIDs.filter((key) => key !== localPublicKey).length : 0;

    let registrationStatus: RegistrationStatus;
    if (serverKeyIDs === undefined) {
        registrationStatus = REGISTRATION_STATUS.NEVER_REGISTERED;
    } else if (serverKeyIDs.length === 0) {
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
        serverKeyIDs,
    };
}

export {REGISTRATION_STATUS};
export type {RegistrationStatus};
export default useBiometricRegistrationStatus;
