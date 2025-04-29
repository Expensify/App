import type {GestureResponderEvent} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import * as E2EGenericPressableWrapper from '@components/Pressable/GenericPressable/index.e2e';
import Performance from '@libs/Performance';

const waitForElement = (testID: string) => {
    console.debug(`[E2E] waitForElement: ${testID}`);

    if (E2EGenericPressableWrapper.getPressableProps(testID)) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const subscription = DeviceEventEmitter.addListener('onBecameVisible', (_testID: string) => {
            if (_testID !== testID) {
                return;
            }

            subscription.remove();
            resolve(undefined);
        });
    });
};

const waitForTextInputValue = (text: string, _testID: string): Promise<void> => {
    return new Promise((resolve) => {
        const subscription = DeviceEventEmitter.addListener('onChangeText', ({testID, value}) => {
            if (_testID !== testID || value !== text) {
                return;
            }

            subscription.remove();
            resolve(undefined);
        });
    });
};

const waitForEvent = (eventName: string): Promise<PerformanceEntry> => {
    return new Promise((resolve) => {
        Performance.subscribeToMeasurements((entry) => {
            if (entry.name !== eventName) {
                return;
            }

            resolve(entry);
        });
    });
};

const tap = (testID: string) => {
    console.debug(`[E2E] Press on: ${testID}`);

    E2EGenericPressableWrapper.getPressableProps(testID)?.onPress?.({} as unknown as GestureResponderEvent);
};

export {waitForElement, tap, waitForEvent, waitForTextInputValue};
