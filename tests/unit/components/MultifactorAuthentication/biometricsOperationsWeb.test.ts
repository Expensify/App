/**
 * This suite reads `window` at module scope, so it pins the jsdom environment
 * instead of relying on the project-wide testEnvironment setting.
 *
 * @jest-environment jsdom
 */
/* eslint-disable max-classes-per-file -- two fake DOM globals (`FakeAuthenticatorAttestationResponse`, `PublicKeyCredential`) are each simplest as a class expression. */
import type * as WebBiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations/index';

import type * as WebAuthnModule from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import {arrayBufferToBase64URL, extractAAGUID} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';

import type * as PasskeyActionsModule from '@userActions/Passkey';
import {getPasskeyOnyxKey} from '@userActions/Passkey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import getOnyxValue from 'tests/utils/getOnyxValue';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

const mockCreatePasskeyCredential = jest.fn<Promise<PublicKeyCredential>, [PublicKeyCredentialCreationOptions, AbortSignal | undefined]>();

// The navigator boundary is the only thing mocked here; the real option-building, extraction, and
// error-decoding helpers stay under test, matching checkDeviceEligibility.test.ts's partial-mock shape.
jest.mock('@libs/MultifactorAuthentication/Passkeys/WebAuthn', () => ({
    ...jest.requireActual<typeof WebAuthnModule>('@libs/MultifactorAuthentication/Passkeys/WebAuthn'),
    createPasskeyCredential: (options: PublicKeyCredentialCreationOptions, signal?: AbortSignal) => mockCreatePasskeyCredential(options, signal),
}));

const mockAddLocalPasskeyCredential = jest.fn<ReturnType<typeof PasskeyActionsModule.addLocalPasskeyCredential>, Parameters<typeof PasskeyActionsModule.addLocalPasskeyCredential>>();

// Only the local-persistence write is mocked here, and only to simulate it rejecting — every other
// test relies on this delegating straight through to the real Onyx-backed implementation.
jest.mock('@userActions/Passkey', () => ({
    ...jest.requireActual<typeof PasskeyActionsModule>('@userActions/Passkey'),
    addLocalPasskeyCredential: (params: Parameters<typeof PasskeyActionsModule.addLocalPasskeyCredential>[0]) => mockAddLocalPasskeyCredential(params),
}));

// jest-expo resolves the native variant by default, so load the web entry point explicitly.
const {areLocalCredentialsKnownToServer, createCredential, deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} = jest.requireActual<
    typeof WebBiometricsOperations
>('@components/MultifactorAuthentication/biometrics/operations/index.ts');

const ACCOUNT_ID = 12345;
const LOCAL_PASSKEY_ID = 'local-passkey-credential-id';

/**
 * jsdom has no `AuthenticatorAttestationResponse` global. `window === globalThis` in jsdom, so
 * assigning it here lets the operation's bare `instanceof AuthenticatorAttestationResponse` check
 * resolve against this fake class.
 */
class FakeAuthenticatorAttestationResponse {
    clientDataJSON: ArrayBuffer;

    attestationObject: ArrayBuffer;

    private transports: string[];

    private authenticatorData: ArrayBuffer;

    constructor(clientDataJSON: ArrayBuffer, attestationObject: ArrayBuffer, transports: string[], authenticatorData: ArrayBuffer) {
        this.clientDataJSON = clientDataJSON;
        this.attestationObject = attestationObject;
        this.transports = transports;
        this.authenticatorData = authenticatorData;
    }

    getTransports(): string[] {
        return this.transports;
    }

    getAuthenticatorData(): ArrayBuffer {
        return this.authenticatorData;
    }
}

function bytesToArrayBuffer(bytes: number[]): ArrayBuffer {
    return new Uint8Array(bytes).buffer;
}

/** 55 bytes so the aaguid slice (bytes 37-52) is populated and meaningful. */
const FAKE_AUTHENTICATOR_DATA = bytesToArrayBuffer(Array.from({length: 55}, (_, index) => index));
const EXPECTED_AAGUID = extractAAGUID(FAKE_AUTHENTICATOR_DATA);

function buildFakeAttestationCredential(rawId: ArrayBuffer, response: unknown) {
    // The operation only reads `rawId` and `response` off the WebAuthn credential, so a minimal fake
    // stands in for the full `PublicKeyCredential` shape jsdom cannot produce.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above.
    return {rawId, response} as unknown as PublicKeyCredential;
}

function buildFakeAttestationResponse(transports: string[] = [CONST.PASSKEY_TRANSPORT.INTERNAL, CONST.PASSKEY_TRANSPORT.HYBRID]) {
    return new FakeAuthenticatorAttestationResponse(bytesToArrayBuffer([1, 2, 3]), bytesToArrayBuffer([4, 5, 6]), transports, FAKE_AUTHENTICATOR_DATA);
}

const REGISTRATION_CHALLENGE: RegistrationChallenge = {
    challenge: 'web-registration-challenge',
    rp: {id: 'expensify.com'},
    user: {id: 'web-test-user', displayName: 'Web Test User'},
    pubKeyCredParams: [{type: 'public-key', alg: -7}],
    timeout: 60000,
};

const originalAuthenticatorAttestationResponseDescriptor = Object.getOwnPropertyDescriptor(window, 'AuthenticatorAttestationResponse');

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
    });

    // No coverage exists yet for `usePasskeys.register()`'s ceremony; this pins it at the operation
    // level ahead of the hook being deleted.
    describe('createCredential', () => {
        // Length must be a multiple of 4, so the decode/encode round trip below (used to inspect
        // `excludeCredentials`) is lossless — anything else can silently drop trailing bits.
        const KNOWN_CREDENTIAL_ID = 'known-cred-idxxx';

        beforeEach(() => {
            mockCreatePasskeyCredential.mockReset();
            mockAddLocalPasskeyCredential
                .mockReset()
                .mockImplementation((params) => jest.requireActual<typeof PasskeyActionsModule>('@userActions/Passkey').addLocalPasskeyCredential(params));
            Object.defineProperty(window, 'AuthenticatorAttestationResponse', {configurable: true, value: FakeAuthenticatorAttestationResponse});
        });

        afterEach(async () => {
            if (originalAuthenticatorAttestationResponseDescriptor) {
                Object.defineProperty(window, 'AuthenticatorAttestationResponse', originalAuthenticatorAttestationResponseDescriptor);
            } else {
                Reflect.deleteProperty(window, 'AuthenticatorAttestationResponse');
            }
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('creates the passkey, persists it locally, and returns the exact keyInfo shape', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [KNOWN_CREDENTIAL_ID, 'server-only-id']});
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: KNOWN_CREDENTIAL_ID, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);

            const rawId = bytesToArrayBuffer([10, 20, 30, 40]);
            const expectedCredentialId = arrayBufferToBase64URL(rawId);
            mockCreatePasskeyCredential.mockResolvedValue(buildFakeAttestationCredential(rawId, buildFakeAttestationResponse()));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result).toEqual({
                success: true,
                keyInfo: {
                    rawId: expectedCredentialId,
                    type: CONST.PASSKEY_CREDENTIAL_TYPE,
                    transports: [CONST.PASSKEY_TRANSPORT.INTERNAL, CONST.PASSKEY_TRANSPORT.HYBRID],
                    aaguid: EXPECTED_AAGUID,
                    response: {
                        clientDataJSON: arrayBufferToBase64URL(bytesToArrayBuffer([1, 2, 3])),
                        attestationObject: arrayBufferToBase64URL(bytesToArrayBuffer([4, 5, 6])),
                    },
                },
            });

            // The reconciled (server-known) local credentials, not the raw local list, are excluded.
            // `buildAllowedCredentialDescriptors` (the real, unmocked helper) always builds `id` as a
            // plain ArrayBuffer, even though the DOM lib widens `PublicKeyCredentialDescriptor.id` to
            // `BufferSource`.
            const optionsPassedToCeremony = mockCreatePasskeyCredential.mock.calls.at(0)?.[0];
            const excludedCredentialId = optionsPassedToCeremony?.excludeCredentials?.at(0)?.id;
            expect(optionsPassedToCeremony?.excludeCredentials).toHaveLength(1);
            expect(excludedCredentialId).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above.
            expect(arrayBufferToBase64URL((excludedCredentialId ?? new ArrayBuffer(0)) as ArrayBuffer)).toBe(KNOWN_CREDENTIAL_ID);

            await waitForBatchedUpdates();
            const storedCredentials = await getOnyxValue(getPasskeyOnyxKey(String(ACCOUNT_ID)));
            expect(storedCredentials?.map((credential) => credential.id)).toEqual(expect.arrayContaining([KNOWN_CREDENTIAL_ID, expectedCredentialId]));
        });

        it('maps a WebAuthn DOMException to the corresponding local error reason', async () => {
            mockCreatePasskeyCredential.mockRejectedValue(new DOMException('The operation was not allowed', 'NotAllowedError'));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WEBAUTHN.NOT_ALLOWED);
        });

        it('rejects an unexpected response type', async () => {
            const rawId = bytesToArrayBuffer([50, 60, 70]);
            mockCreatePasskeyCredential.mockResolvedValue(buildFakeAttestationCredential(rawId, {}));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WEBAUTHN.UNEXPECTED_RESPONSE);
        });

        it('still persists the credential when reconciliation has already wiped the duplicate id', async () => {
            // The backend doesn't know this id, so reconciliation removes it from Onyx before the
            // ceremony runs. The ceremony then resolves with the same rawId bytes, so the new
            // credential's id collides with the entry reconciliation just wiped. A duplicate check
            // against the stale pre-reconciliation list would spuriously throw here and, if swallowed,
            // would leave the credential registered on the backend but absent from local storage --
            // the next launch would find no local credential and force re-registration. Success alone
            // doesn't catch that regression, so this also asserts the credential is actually stored.
            const rawId = bytesToArrayBuffer([70, 80, 90]);
            const duplicateCredentialId = arrayBufferToBase64URL(rawId);
            await Onyx.set(getPasskeyOnyxKey(String(ACCOUNT_ID)), [{id: duplicateCredentialId, type: CONST.PASSKEY_CREDENTIAL_TYPE}]);
            mockCreatePasskeyCredential.mockResolvedValue(buildFakeAttestationCredential(rawId, buildFakeAttestationResponse()));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result.success).toBe(true);

            await waitForBatchedUpdates();
            const storedCredentials = await getOnyxValue(getPasskeyOnyxKey(String(ACCOUNT_ID)));
            expect(storedCredentials?.map((credential) => credential.id)).toEqual([duplicateCredentialId]);
        });

        it('fails instead of reporting success when the local Onyx write rejects', async () => {
            // If this were swallowed, the caller would register the credential with the backend
            // anyway, leaving the server aware of a credential this device can't find in Onyx again --
            // `areLocalCredentialsKnownToServer` would force the user back into registration.
            mockAddLocalPasskeyCredential.mockRejectedValueOnce(new Error('Onyx write failed'));
            mockCreatePasskeyCredential.mockResolvedValue(buildFakeAttestationCredential(bytesToArrayBuffer([11, 22, 33]), buildFakeAttestationResponse()));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.LOCAL_PERSISTENCE_FAILED);

            await waitForBatchedUpdates();
            const storedCredentials = await getOnyxValue(getPasskeyOnyxKey(String(ACCOUNT_ID)));
            expect(storedCredentials ?? []).toEqual([]);
        });

        it('passes the abort signal through to the ceremony, so cancelling the flow can close the passkey dialog', async () => {
            const controller = new AbortController();
            mockCreatePasskeyCredential.mockResolvedValue(buildFakeAttestationCredential(bytesToArrayBuffer([1, 2, 3]), buildFakeAttestationResponse()));

            await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: controller.signal});

            expect(mockCreatePasskeyCredential.mock.calls.at(0)?.[1]).toBe(controller.signal);
        });

        it('does not persist or register a credential when the flow was cancelled while the ceremony resolved anyway', async () => {
            // Some browsers don't honor `signal` on create(), so the ceremony can still succeed after
            // the flow was already cancelled — simulated here by aborting from inside the mock.
            const controller = new AbortController();
            const rawId = bytesToArrayBuffer([90, 91, 92]);
            mockCreatePasskeyCredential.mockImplementation(async () => {
                controller.abort();
                return buildFakeAttestationCredential(rawId, buildFakeAttestationResponse());
            });

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: controller.signal});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);

            await waitForBatchedUpdates();
            const storedCredentials = await getOnyxValue(getPasskeyOnyxKey(String(ACCOUNT_ID)));
            expect(storedCredentials ?? []).toEqual([]);
        });
    });
});
