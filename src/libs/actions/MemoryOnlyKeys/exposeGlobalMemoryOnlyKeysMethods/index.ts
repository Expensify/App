import * as MemoryOnlyKeys from '@userActions/MemoryOnlyKeys/MemoryOnlyKeys';
import type ExposeGlobalMemoryOnlyKeysMethods from './types';

const exposeGlobalMemoryOnlyKeysMethods: ExposeGlobalMemoryOnlyKeysMethods = () => {
    window.enableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.enable();
    };
    window.disableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.disable();
    };
};

export default exposeGlobalMemoryOnlyKeysMethods;
