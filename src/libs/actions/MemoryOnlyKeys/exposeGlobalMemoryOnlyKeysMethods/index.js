import * as MemoryOnlyKeys from '../MemoryOnlyKeys';

const exposeGlobalMemoryOnlyKeysMethods = () => {
    window.enableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.enable();
    };
    window.disableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.disable();
    };
};

export default exposeGlobalMemoryOnlyKeysMethods;
