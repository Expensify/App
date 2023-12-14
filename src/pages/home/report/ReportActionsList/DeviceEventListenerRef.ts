import {EmitterSubscription,DeviceEventEmitter} from 'react-native';

export default class DeviceEventListenerRef {
    private typePrefix: string;

    private subscription: EmitterSubscription | null = null;

    constructor(typePrefix: string) {
        this.typePrefix = typePrefix;
    }

    static use(typePrefix: string): DeviceEventListenerRef {
        return new DeviceEventListenerRef(typePrefix);
    }

    add(
        typeSuffix: string, // report.reportID
        listener: (data: unknown) => void,
    ): void {
        this.subscription = DeviceEventEmitter.addListener(`${this.typePrefix}_${typeSuffix}`, listener);
    }

    remove(): void {
        if (!this.subscription) {
            return;
        }
        this.subscription.remove();
        this.subscription = null;
    }
}
