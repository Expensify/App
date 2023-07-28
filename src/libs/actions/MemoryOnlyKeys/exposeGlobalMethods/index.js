import * as MemoryOnlyKeys from '../MemoryOnlyKeys';

const exposeGlobalMethods = () => {
    window.enableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.enable();
    };
    window.disableMemoryOnlyKeys = () => {
        MemoryOnlyKeys.disable();
    };
};

export default exposeGlobalMethods;
