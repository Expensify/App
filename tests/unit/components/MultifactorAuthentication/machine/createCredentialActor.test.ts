import type * as BiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations';
import createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {CreateCredentialInput} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';

import {processRegistration} from '@userActions/MultifactorAuthentication/processing';
import type * as ProcessingActions from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

import {MFA_TEST_REGISTRATION_CHALLENGE} from 'tests/utils/mfa/flowFixtures';
import {createActor, waitFor} from 'xstate';

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const mockCreateCredential = jest.fn();

// The actor's own decisions (short-circuit on refusal, forward keyInfo, no rollback on a backend
// failure) are what this suite pins, so the platform ceremony and the backend call are mocked here.
jest.mock('@components/MultifactorAuthentication/biometrics/operations', () => ({
    ...jest.requireActual<typeof BiometricsOperations>('@components/MultifactorAuthentication/biometrics/operations'),
    createCredential: (...args: unknown[]) => mockCreateCredential(...args),
}));

jest.mock('@userActions/MultifactorAuthentication/processing', () => ({
    ...jest.requireActual<typeof ProcessingActions>('@userActions/MultifactorAuthentication/processing'),
    processRegistration: jest.fn(),
}));

const processRegistrationMock = jest.mocked(processRegistration);

const ACCOUNT_ID = 12345;

const CREATE_CREDENTIAL_INPUT: CreateCredentialInput = {
    accountID: ACCOUNT_ID,
    registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE,
};

const KEY_INFO: RegistrationKeyInfo = {
    rawId: 'credential-raw-id',
    type: 'public-key',
    response: {clientDataJSON: 'client-data-json', attestationObject: 'attestation-object'},
};

/** Runs the machine's real `createCredential` actor logic to completion and returns its final snapshot. */
async function runCreateCredentialActor() {
    const {createCredential} = createActors();
    const actorRef = createActor(createCredential, {input: CREATE_CREDENTIAL_INPUT});
    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
    return actorRef.getSnapshot();
}

describe('createCredential actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('short-circuits on a platform refusal and never calls processRegistration', async () => {
        const platformError = createLocalMFAError(REASON.LOCAL_ERRORS.WEBAUTHN.NOT_ALLOWED, 'User dismissed the passkey dialog');
        mockCreateCredential.mockResolvedValue({success: false, error: platformError});

        const snapshot = await runCreateCredentialActor();

        expect(snapshot.output).toEqual({success: false, error: platformError});
        expect(processRegistrationMock).not.toHaveBeenCalled();
    });

    it('forwards the exact keyInfo to processRegistration and returns its result on success', async () => {
        mockCreateCredential.mockResolvedValue({success: true, keyInfo: KEY_INFO});
        processRegistrationMock.mockResolvedValue({success: true});

        const snapshot = await runCreateCredentialActor();

        expect(processRegistrationMock).toHaveBeenCalledWith({keyInfo: KEY_INFO});
        expect(snapshot.output).toEqual({success: true});
    });

    it('surfaces a backend failure unchanged and performs no rollback', async () => {
        mockCreateCredential.mockResolvedValue({success: true, keyInfo: KEY_INFO});
        const backendError = createLocalMFAError(REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Backend rejected the key');
        processRegistrationMock.mockResolvedValue({success: false, error: backendError});

        const snapshot = await runCreateCredentialActor();

        // No rollback: the actor's contract is to surface the backend result as-is, with no key
        // deletion and no local-credential clearing attempted on this path.
        expect(snapshot.output).toEqual({success: false, error: backendError});
    });
});
