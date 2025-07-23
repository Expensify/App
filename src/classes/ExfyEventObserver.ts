import {EmitterSubscription, NativeEventEmitter, NativeModule} from 'react-native';

const nativeModuleTemplate: NativeModule = {
    addListener: () => {},
    removeListeners: () => {},
};

/**
 * Allows for the creation of an event observer that can be used to listen for events
 * and emit events. This is an abstraction around the NativeEventEmitter class from react-native.
 */
class ExfyEventObserver {
    /**
     * @property eventHandler - the NativeEventEmitter instance
     */
    private eventHandler: NativeEventEmitter;

    /**
     * @property eventSubscription - the EmitterSubscription instance
     */
    private eventSubscription: EmitterSubscription | null;

    /**
     * @property nativeModuleTemplate - the NativeModule implementation. It should only be used
     * when communicating between JS modules and on Android. On IOS, the NativeModule is required
     * and you should pass the appropriate NativeModule implementation to the constructor.
     */
    static nativeModuleTemplate = nativeModuleTemplate;

    /**
     *
     * @param nativeModule the NativeModule implementation. This is required on IOS and will throw
     * an invariant error if undefined. This requirement is mainly when working with NativeModules.
     *
     * If using this class for communication between JS modules, you can pass undefined as the
     * nativeModule parameter or use the @property nativeModuleTemplate to pass the template.
     */
    constructor(nativeModule?: NativeModule) {
        this.eventHandler = new NativeEventEmitter(nativeModule);
        this.eventSubscription = null;
    }

    /**
     * Adds the listener to the event handler.
     *
     * @param eventType - name of the event for which we are registering listener
     * @param listener - the listener function
     * @param context - context of the listener
     */
    addListener(eventType: string, listener: (event: unknown) => void, context?: unknown) {
        this.eventSubscription = this.eventHandler.addListener(eventType, listener, Object(context));
    }

    /**
     * Remove all listeners for the specified event type.
     *
     * @param eventType - name of the event whose registered listeners to remove
     */
    removeAllListeners(eventType: string) {
        this.eventHandler.removeAllListeners(eventType);
    }

    /**
     * Removes the current listener from the event handler.
     */
    removeListener() {
        if (!this.eventSubscription) return;
        this.eventHandler.removeSubscription(this.eventSubscription);
    }

    /**
     * Emits an event of the given type with the given data.
     *
     * @param eventType - Name of the event to emit
     * @param Arbitrary arguments to be passed to each registered listener
     */
    emit(eventType: string, ...args: unknown[]) {
        this.eventHandler.emit(eventType, ...args);
    }
}

export default ExfyEventObserver;
