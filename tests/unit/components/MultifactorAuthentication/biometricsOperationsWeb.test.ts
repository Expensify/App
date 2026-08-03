/**
 * This suite reads `window` at module scope, so it pins the jsdom environment
 * instead of relying on the project-wide testEnvironment setting.
 *
 * @jest-environment jsdom
 */
import type * as WebBiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations/index';

import {getPasskeyOnyxKey} from '@userActions/Passkey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

// jest-expo resolves the native variant by default, so load the web entry point explicitly.
const {areLocalCredentialsKnownToServer, deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} = jest.requireActual<typeof WebBiometricsOperations>(
    '@components/MultifactorAuthentication/biometrics/operations/index.ts',
);

const ACCOUNT_ID = 12345;
const LOCAL_PASSKEY_ID = 'local-passkey-credential-id';

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

        it('returns true when a local passkey is among the server-known credential IDs', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id', LOCAL_PASSKEY_ID]});
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: LOCAL_PASSKEY_ID, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(true);
        });

        it('returns false when the server does not know the local passkey', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id']});
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: LOCAL_PASSKEY_ID, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('returns false when the account has no local passkeys', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_PASSKEY_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('waits for the initial account data before deciding that registration is required', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: false,
                [ONYXKEYS.IS_LOADING_APP]: true,
            });
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: LOCAL_PASSKEY_ID, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);

            const credentialsCheck = areLocalCredentialsKnownToServer(ACCOUNT_ID);
            await waitForBatchedUpdates();

            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_PASSKEY_ID]});
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: true,
                [ONYXKEYS.IS_LOADING_APP]: false,
            });

            await expect(credentialsCheck).resolves.toBe(true);
        });

        it('does not trust stale server credentials while new account data is loading', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_PASSKEY_ID]});
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: LOCAL_PASSKEY_ID, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);

            const credentialsCheck = areLocalCredentialsKnownToServer(ACCOUNT_ID);
            await waitForBatchedUpdates();

            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: []});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);

            await expect(credentialsCheck).resolves.toBe(false);
        });
    });
});
