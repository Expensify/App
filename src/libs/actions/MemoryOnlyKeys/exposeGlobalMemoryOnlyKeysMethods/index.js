import * as MemoryOnlyKeys from '@userActions/MemoryOnlyKeys/MemoryOnlyKeys';

const exposeGlobalMemoryOnlyKeysMethods = () => {
    window.enableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.enable();
    };
    window.disableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.disable();
    };
};

export default exposeGlobalMemoryOnlyKeysMethods;
