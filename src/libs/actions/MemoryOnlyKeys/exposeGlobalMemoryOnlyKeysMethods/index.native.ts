import type ExposeGlobalMemoryOnlyKeysMethods from './types';

/**
 * This is a no-op because the global methods will only work for web and desktop
 */
const exposeGlobalMemoryOnlyKeysMethods: ExposeGlobalMemoryOnlyKeysMethods = () => {};

export default exposeGlobalMemoryOnlyKeysMethods;
