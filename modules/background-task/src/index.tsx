import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@expensify/react-native-background-task' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const ReactNativeBackgroundTaskModule = isTurboModuleEnabled
  ? require('./NativeReactNativeBackgroundTask').default
  : NativeModules.ReactNativeBackgroundTask;

const ReactNativeBackgroundTask = ReactNativeBackgroundTaskModule
  ? ReactNativeBackgroundTaskModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return ReactNativeBackgroundTask.multiply(a, b);
}
