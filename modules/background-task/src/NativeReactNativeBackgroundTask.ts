import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

// We need to export the interface inline for proper TypeScript type inference with TurboModules
// eslint-disable-next-line rulesdir/no-inline-named-export, @typescript-eslint/consistent-type-definitions
export interface Spec extends TurboModule {
    defineTask(taskName: string, taskExecutor: (data: unknown) => void | Promise<void>): Promise<void>;
    readonly onBackgroundTaskExecution: EventEmitter<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeBackgroundTask');
