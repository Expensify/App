import {NativeEventEmitter, NativeModules} from 'react-native';

const {RNWallet} = NativeModules;

interface AddPassRequest {
    last4: string;
    cardHolder: string;
}

interface CompletePassRequest {
    activation: string;
    encryptedData: string;
    ephemeralKey: string;
}

const eventEmitter = new NativeEventEmitter(RNWallet);

const ApplePushProvisioningModule = {
    async canAddPass(): Promise<boolean> {
        try {
            return await RNWallet.canAddPass();
        } catch {
            throw new Error(`Error checking add pass capability.`);
        }
    },
    async startAddPass(request: AddPassRequest): Promise<void> {
        try {
            return await RNWallet.startAddPass(request.last4, request.cardHolder);
        } catch {
            throw new Error(`Error starting add pass.`);
        }
    },
    async completeAddPass(request: CompletePassRequest): Promise<void> {
        try {
            RNWallet.completeAddPass(request.activation, request.encryptedData, request.ephemeralKey);
        } catch {
            throw new Error(`Error completing add pass.`);
        }
    },
    addEventListener(event: string, callback: (data: any) => void) {
        eventEmitter.addListener(event, callback);
    },
    removeAllListeners(event: string) {
        eventEmitter.removeAllListeners(event);
    },
};

export default ApplePushProvisioningModule;
