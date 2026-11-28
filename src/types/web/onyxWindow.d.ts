import type Onyx from 'react-native-onyx';
import type {CollectionKeyBase} from 'react-native-onyx/dist/types';

declare global {
    // Global methods for Onyx key management for debugging purposes
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        Onyx: typeof Onyx & {
            log?: (key: CollectionKeyBase) => void;
        };
    }
}

export {};
