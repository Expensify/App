import {NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';

type Tsp = 'VISA' | 'MASTERCARD';

type UserAddress = {
    name: string;
    addressOne: string;
    addressTwo: string;
    locality: string;
    administrativeArea: string;
    countryCode: string;
    postalCode: string;
    phoneNumber: string;
};

type PushTokenizeRequest = {
    opc: string;
    tsp: Tsp;
    clientName: string;
    lastDigits: string;
    address: UserAddress;
};

type GooglePushProvisioningType = NativeModule & {
    getTokenStatus: (tsp: Tsp, tokenReferenceId: string) => Promise<number>;
    getActiveWalletID: () => Promise<string>;
    getStableHardwareId: () => Promise<string>;
    getEnvironment: () => Promise<string>;
    pushProvision: (opc: string, tsp: Tsp, clientName: string, lastDigits: string, addressJson: string) => Promise<string>;
};

const LINKING_ERROR = 'Error linking GooglePushProvisioning module.';

const GooglePushProvisioning: GooglePushProvisioningType = NativeModules.GooglePushProvisioning
    ? NativeModules.GooglePushProvisioning
    : new Proxy<GooglePushProvisioningType>({} as GooglePushProvisioningType, {
          get() {
              throw new Error(LINKING_ERROR);
          },
      });

const GooglePushProvisioningModule = {
    /**
     * Retrieves the active wallet ID.
     * @returns A promise that resolves to the active wallet ID.
     */
    getActiveWalletID(): Promise<string> {
        return GooglePushProvisioning.getActiveWalletID();
    },

    /**
     * Retrieves the stable hardware ID.
     * @returns A promise that resolves to the stable hardware ID.
     */
    getStableHardwareId(): Promise<string> {
        return GooglePushProvisioning.getStableHardwareId();
    },

    /**
     * Retrieves the environment.
     * @returns A promise that resolves to the environment.
     */
    getEnvironment(): Promise<string> {
        return GooglePushProvisioning.getEnvironment();
    },

    /**
     * Retrieves the status of a token.
     * @param tsp - The token service provider (VISA or MASTERCARD).
     * @param tokenReferenceId - The token reference ID.
     * @returns A promise that resolves to the token status.
     */
    getTokenStatus(tsp: Tsp, tokenReferenceId: string): Promise<number> {
        return GooglePushProvisioning.getTokenStatus(tsp, tokenReferenceId);
    },

    /**
     * Initiates the push provisioning process.
     * @param request - The push tokenize request object.
     * @returns A promise that resolves when the push provisioning process is complete.
     */
    pushProvision(request: PushTokenizeRequest): Promise<string> {
        const addressJson = JSON.stringify(request.address);
        return GooglePushProvisioning.pushProvision(request.opc, request.tsp, request.clientName, request.lastDigits, addressJson);
    },
};

export default GooglePushProvisioningModule;
export type {PushTokenizeRequest, UserAddress, Tsp};
