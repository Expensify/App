// jest-expo defaults to the ios platform, so this import resolves the native operations module
// (operations/index.native.ts), which checks the HSM biometric sensor.
import {
    areLocalCredentialsKnownToServer,
    deviceCheckFailureReason,
    deviceVerificationType,
    doesDeviceSupportAuthenticationMethod,
} from '@components/MultifactorAuthentication/biometrics/operations';

import VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

const mockIsSensorAvailable = jest.fn();
const mockGetAllKeys = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
}));

const ACCOUNT_ID = 12345;
// The keystore returns the public key as plain base64 while the server stores base64url IDs, so the
// characters below only match after the module's base64url conversion.
const LOCAL_PUBLIC_KEY_BASE64 = 'Ab+/cd==';
const LOCAL_CREDENTIAL_ID = 'Ab-_cd';

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
        beforeEach(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: true,
                [ONYXKEYS.IS_LOADING_APP]: false,
            });
            await waitForBatchedUpdates();
        });

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

        it('should wait for the initial account data before deciding that registration is required', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: false,
                [ONYXKEYS.IS_LOADING_APP]: true,
            });

            const credentialsCheck = areLocalCredentialsKnownToServer(ACCOUNT_ID);
            await waitForBatchedUpdates();

            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: true,
                [ONYXKEYS.IS_LOADING_APP]: false,
            });

            await expect(credentialsCheck).resolves.toBe(true);
        });

        it('should not trust stale server credentials while new account data is loading', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);

            const credentialsCheck = areLocalCredentialsKnownToServer(ACCOUNT_ID);
            await waitForBatchedUpdates();

            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: []});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);

            await expect(credentialsCheck).resolves.toBe(false);
        });
    });
});
