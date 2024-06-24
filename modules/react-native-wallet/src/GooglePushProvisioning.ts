import {NativeEventEmitter, NativeModules} from 'react-native';

const {GooglePushProvisioning} = NativeModules;

type Tsp = 'VISA' | 'MASTERCARD';

interface UserAddress {
    name: string;
    addressOne: string;
    addressTwo: string;
    locality: string;
    administrativeArea: string;
    countryCode: string;
    postalCode: string;
    phoneNumber: string;
}

interface PushTokenizeRequest {
    opc: string;
    tsp: Tsp;
    clientName: string;
    lastDigits: string;
    address: UserAddress;
}

const eventEmitter = new NativeEventEmitter(GooglePushProvisioning);

const GooglePushProvisioningModule = {
    async getTokenStatus(tsp: Tsp, tokenReferenceId: string): Promise<number> {
        try {
            return await GooglePushProvisioning.getTokenStatus(tsp, tokenReferenceId);
        } catch {
            throw new Error(`Error getting token status.`);
        }
    },
    async getActiveWalletID(): Promise<string> {
        try {
            return await GooglePushProvisioning.getActiveWalletID();
        } catch {
            throw new Error(`Error getting active wallet ID.`);
        }
    },
    async getStableHardwareId(): Promise<string> {
        try {
            return await GooglePushProvisioning.getStableHardwareId();
        } catch {
            throw new Error(`Error getting stable hardware ID.`);
        }
    },
    async getEnvironment(): Promise<string> {
        try {
            return await GooglePushProvisioning.getEnvironment();
        } catch {
            throw new Error(`Error getting environment.`);
        }
    },
    async pushProvision(request: PushTokenizeRequest): Promise<string> {
        try {
            const addressJson = JSON.stringify(request.address);
            return await GooglePushProvisioning.pushProvision(request.opc, request.tsp, request.clientName, request.lastDigits, addressJson);
        } catch {
            throw new Error(`Error during push provision.`);
        }
    },
    addEventListener(event: string, callback: (data: any) => void) {
        eventEmitter.addListener(event, callback);
    },
    removeAllListeners(event: string) {
        eventEmitter.removeAllListeners(event);
    },
};

export default GooglePushProvisioningModule;
