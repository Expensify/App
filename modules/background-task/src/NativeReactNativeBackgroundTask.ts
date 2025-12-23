import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

// We need to export the interface inline for proper TypeScript type inference with TurboModules
// eslint-disable-next-line rulesdir/no-inline-named-export, @typescript-eslint/consistent-type-definitions
export interface Spec extends TurboModule {
    defineTask(taskName: string, taskExecutor: (data: unknown) => void | Promise<void>): Promise<void>;
    startReceiptUpload(options: Object): Promise<void>;
    addListener: (eventType: string) => void;
    removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeBackgroundTask');
