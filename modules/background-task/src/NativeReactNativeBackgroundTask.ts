import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    defineTask(taskName: string, taskExecutor: (data: unknown) => void | Promise<void>): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeBackgroundTask');
