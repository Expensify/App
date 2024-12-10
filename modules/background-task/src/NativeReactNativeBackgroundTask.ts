import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
    defineTask(taskName: string, taskExecutor: (data: unknown) => void | Promise<void>): Promise<void>;
    readonly onBackgroundTaskExecution: EventEmitter<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeBackgroundTask');
