import {NativeEventEmitter, NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';

type AddPassRequest = {
    last4: string;
    cardHolderName: string;
};

type CompletePassRequest = {
    activation: string;
    encryptedData: string;
    ephemeralKey: string;
};

type GetPassAndActivationEvent = {
    certificateLeaf: string;
    certificateSubCA: string;
    nonce: string;
    nonceSignature: string;
};

type SupportedEvents = 'addPaymentPassViewControllerDidFinish' | 'getPassAndActivation';

type ApplePushProvisioningType = NativeModule & {
    canAddPaymentPass: () => Promise<boolean>;
    startAddPaymentPass: (last4: string, cardHolderName: string) => Promise<void>;
    completeAddPaymentPass: (activation: string, encryptedData: string, ephemeralKey: string) => Promise<void>;
};

const LINKING_ERROR = "Error linking ApplePushProvisioning module.";

const ApplePushProvisioning: ApplePushProvisioningType = NativeModules.ApplePushProvisioning
  ? NativeModules.ApplePushProvisioning
  : new Proxy<ApplePushProvisioningType>({} as ApplePushProvisioningType, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    }); 

const eventEmitter = ApplePushProvisioning ? new NativeEventEmitter(ApplePushProvisioning) : null;

const ApplePushProvisioningModule = {
    /**
     * Checks if a payment pass can be added.
     * @returns A promise that resolves to a boolean indicating if a payment pass can be added.
     */
    canAddPaymentPass(): Promise<boolean> {
        return ApplePushProvisioning.canAddPaymentPass();
    },

    /**
     * Starts the process of adding a payment pass.
     * @param request - The request object containing the last 4 digits of the card and the card holder's name.
     * @returns A promise that resolves when the process is started.
     */
    startAddPaymentPass(request: AddPassRequest): Promise<void> {
        return ApplePushProvisioning.startAddPaymentPass(request.last4, request.cardHolderName);
    },

    /**
     * Completes the process of adding a payment pass.
     * @param request - The request object containing activation data, encrypted data, and ephemeral key.
     * @returns A promise that resolves when the process is completed.
     */
    completeAddPaymentPass(request: CompletePassRequest): Promise<void> {
        return ApplePushProvisioning.completeAddPaymentPass(request.activation, request.encryptedData, request.ephemeralKey);
    },

    /**
     * Adds an event listener for the specified event.
     * @param event - The event name to listen for.
     * @param callback - The callback function to handle the event.
     */
    addEventListener<T extends SupportedEvents>(event: T, callback: (e: T extends 'getPassAndActivation' ? {data: GetPassAndActivationEvent} : never) => void) {
        if (!eventEmitter) {
            return;
        }
        eventEmitter.addListener(event, callback);
    },

    /**
     * Removes all listeners for the specified event.
     * @param event - The event name to remove listeners for.
     */
    removeAllListeners(event: SupportedEvents) {
        if (!eventEmitter) {
            return;
        }
        eventEmitter.removeAllListeners(event);
    },
};

export default ApplePushProvisioningModule;
export type {AddPassRequest, CompletePassRequest, GetPassAndActivationEvent};
