// jest-expo defaults to the ios platform, so this import resolves the native operations module
// (operations/index.native.ts), which checks the HSM biometric sensor.
import {
    areLocalCredentialsKnownToServer,
    createCredential,
    deviceCheckFailureReason,
    deviceVerificationType,
    doesDeviceSupportAuthenticationMethod,
} from '@components/MultifactorAuthentication/biometrics/operations';

import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Base64URL from '@src/utils/Base64URL';

import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

const mockIsSensorAvailable = jest.fn();
const mockGetAllKeys = jest.fn();
const mockCreateKeys = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    createKeys: (...args: unknown[]) => mockCreateKeys(...args),
}));

const ACCOUNT_ID = 12345;
// The keystore returns the public key as plain base64 while the server stores base64url IDs, so the
// characters below only match after the module's base64url conversion.
const LOCAL_PUBLIC_KEY_BASE64 = 'Ab+/cd==';
const LOCAL_CREDENTIAL_ID = 'Ab-_cd';
const REGISTRATION_CHALLENGE: RegistrationChallenge = {
    challenge: 'native-registration-challenge',
    rp: {id: 'expensify.com'},
    user: {id: 'native-test-user', displayName: 'Native Test User'},
    pubKeyCredParams: [{type: 'public-key', alg: -7}],
    timeout: 60000,
};

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

    describe('areLocalCredentialsKnownToServer', () => {
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('should return true when the local HSM key is among the server-known credential IDs', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id', LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(true);
        });

        it('should return false when the server does not know the local HSM key', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id']});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('should return false when the device holds no key for the account', async () => {
            mockGetAllKeys.mockResolvedValue({keys: []});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('should return false when the keystore read throws', async () => {
            mockGetAllKeys.mockRejectedValue(new Error('Keystore unavailable'));
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });
    });

    // Mirrors the `register` cases in useNativeBiometricsHSM.test.ts, which move over here when that
    // hook is deleted.
    describe('createCredential', () => {
        beforeEach(() => {
            mockCreateKeys.mockResolvedValue({publicKey: LOCAL_PUBLIC_KEY_BASE64});
        });

        it('creates the HSM key with the account-specific alias', async () => {
            await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(mockCreateKeys).toHaveBeenCalledWith('12345_HSM_KEY', 'ec256', undefined, true, false);
        });

        it('returns the exact NativeBiometricsHSMKeyInfo shape on success', async () => {
            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result).toEqual({
                success: true,
                keyInfo: {
                    rawId: LOCAL_CREDENTIAL_ID,
                    type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                    response: {
                        clientDataJSON: Base64URL.encode(JSON.stringify({challenge: REGISTRATION_CHALLENGE.challenge})),
                        biometric: {
                            publicKey: LOCAL_CREDENTIAL_ID,
                            algorithm: CONST.COSE_ALGORITHM.ES256,
                        },
                    },
                },
            });
        });

        it('returns a failed result with the mapped reason when the library throws', async () => {
            mockCreateKeys.mockRejectedValue(Object.assign(new Error('Key creation failed'), {code: 'CREATE_KEYS_ERROR'}));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED);
        });
    });
});
