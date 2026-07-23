import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';

import Onyx from 'react-native-onyx';
import {fromPromise} from 'xstate';

import type {ReadHasAcceptedSoftPromptInput, ValidateDeviceInput} from './types';

/**
 * A refused device resolves as a failed MFAResult, so the machine's onError transition for this
 * actor fires only when the platform check throws unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.allowedAuthenticationMethods));

/**
 * Reads the account's device-local soft-prompt flag once. The temporary Onyx connection is
 * disconnected after the first value or when XState stops the actor.
 */
const readHasAcceptedSoftPrompt = fromPromise<boolean, ReadHasAcceptedSoftPromptInput>(
    ({input, signal}) =>
        new Promise<boolean>((resolve) => {
            let connection: ReturnType<typeof Onyx.connectWithoutView>;
            const disconnect = () => Onyx.disconnect(connection);

            signal.addEventListener('abort', disconnect, {once: true});
            connection = Onyx.connectWithoutView({
                key: getDeviceBiometricsOnyxKey(input.accountID),
                callback: (deviceBiometrics) => {
                    signal.removeEventListener('abort', disconnect);
                    disconnect();
                    resolve(deviceBiometrics?.hasAcceptedSoftPrompt ?? false);
                },
            });
        }),
);

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {validateDevice, readHasAcceptedSoftPrompt};
}

export default createActors;
