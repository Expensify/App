import {DeviceEventEmitter} from 'react-native';
import * as E2EGenericPressableWrapper from '@components/Pressable/GenericPressable/index.e2e';

const waitFor = (testID: string) => {
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

const tap = (testID: string) => {
    E2EGenericPressableWrapper.getPressableProps(testID)?.onPress?.();
};

export {waitFor, tap};
