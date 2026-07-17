import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';

import type {EventObject} from 'xstate';

import Onyx from 'react-native-onyx';
import {fromCallback, fromPromise} from 'xstate';

import type {ReadHasAcceptedSoftPromptInput, SoftPromptAcceptanceReadEvent, ValidateDeviceInput} from './types';

/**
 * A refused device resolves as a failed MFAResult, so the machine's onError transition for this
 * actor fires only when the platform check throws unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.allowedAuthenticationMethods));

/**
 * Subscribes to the current account's device-local soft-prompt flag. The first value sends the
 * machine out of the invoking state, whose exit stops this actor and disconnects the subscription.
 */
const readHasAcceptedSoftPrompt = fromCallback<EventObject, ReadHasAcceptedSoftPromptInput>(({input, sendBack}) => {
    const connection = Onyx.connectWithoutView({
        key: getDeviceBiometricsOnyxKey(input.accountID),
        callback: (deviceBiometrics) => {
            sendBack({type: 'ACTOR_SOFT_PROMPT_ACCEPTANCE_READ', accepted: deviceBiometrics?.hasAcceptedSoftPrompt ?? false} satisfies SoftPromptAcceptanceReadEvent);
        },
    });

    return () => Onyx.disconnect(connection);
});

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {validateDevice, readHasAcceptedSoftPrompt};
}

export default createActors;
