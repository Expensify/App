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
 * Resolves with the current account's device-local soft-prompt flag. Onyx exposes this value through
 * its callback API, so the promise disconnects the temporary connection after the first value or
 * when XState stops the actor.
 */
const readHasAcceptedSoftPrompt = fromPromise<boolean, ReadHasAcceptedSoftPromptInput>(
    ({input, signal}) =>
        new Promise<boolean>((resolve) => {
            let connection: ReturnType<typeof Onyx.connectWithoutView> | undefined;
            let shouldDisconnect = false;
            let settled = false;

            const disconnect = () => {
                if (connection === undefined) {
                    shouldDisconnect = true;
                    return;
                }
                Onyx.disconnect(connection);
                connection = undefined;
            };
            const resolveFirstValue = (accepted: boolean) => {
                if (settled) {
                    return;
                }
                settled = true;
                signal.removeEventListener('abort', disconnect);
                disconnect();
                resolve(accepted);
            };

            signal.addEventListener('abort', disconnect, {once: true});
            connection = Onyx.connectWithoutView({
                key: getDeviceBiometricsOnyxKey(input.accountID),
                callback: (deviceBiometrics) => resolveFirstValue(deviceBiometrics?.hasAcceptedSoftPrompt ?? false),
            });
            if (shouldDisconnect) {
                disconnect();
            }
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
