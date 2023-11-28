import * as MemoryOnlyKeys from '@userActions/MemoryOnlyKeys/MemoryOnlyKeys';
import type ExposeGlobalMemoryOnlyKeysMethods from './types';

type WindowWithMemoryOnlyKeys = Window & {
    enableMemoryOnlyKeys?: () => void;
    disableMemoryOnlyKeys?: () => void;
};

const exposeGlobalMemoryOnlyKeysMethods: ExposeGlobalMemoryOnlyKeysMethods = () => {
    (window as WindowWithMemoryOnlyKeys).enableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.enable();
    };
    (window as WindowWithMemoryOnlyKeys).disableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.disable();
    };
};

export default exposeGlobalMemoryOnlyKeysMethods;
