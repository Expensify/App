import type * as BiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations';
import createActors from '@components/MultifactorAuthentication/machine/mfaActors';

import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';

import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, waitFor} from 'xstate';

const mockAreLocalCredentialsKnownToServer = jest.fn();

jest.mock('@components/MultifactorAuthentication/biometrics/operations', () => ({
    ...jest.requireActual<typeof BiometricsOperations>('@components/MultifactorAuthentication/biometrics/operations'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    areLocalCredentialsKnownToServer: (...args: unknown[]) => mockAreLocalCredentialsKnownToServer(...args),
}));

const ACCOUNT_ID = 12345;

async function runLoadRegistrationStateActor() {
    const {loadRegistrationState} = createActors();
    const actorRef = createActor(loadRegistrationState, {input: {accountID: ACCOUNT_ID}});
    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
    return actorRef.getSnapshot();
}

describe('loadRegistrationState actor', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('loads the credential match and persisted soft-prompt acceptance for the requested account', async () => {
        mockAreLocalCredentialsKnownToServer.mockResolvedValue(true);
        await Onyx.merge(getDeviceBiometricsOnyxKey(ACCOUNT_ID), {hasAcceptedSoftPrompt: true});

        const snapshot = await runLoadRegistrationStateActor();

        expect(mockAreLocalCredentialsKnownToServer).toHaveBeenCalledWith(ACCOUNT_ID, expect.any(AbortSignal));
        expect(snapshot.output).toEqual({hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true});
    });

    it('defaults soft-prompt acceptance to false when the account has no persisted value', async () => {
        mockAreLocalCredentialsKnownToServer.mockResolvedValue(false);

        const snapshot = await runLoadRegistrationStateActor();

        expect(snapshot.output).toEqual({hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false});
    });
});
