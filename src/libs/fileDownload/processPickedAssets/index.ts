import type ProcessPickedAssetsFunction from './types';

/**
 * Web has no native image picker, so nothing reaches this module. It exists so the native
 * implementation resolves through a platform-agnostic import path.
 */
const processPickedAssetsSequentially: ProcessPickedAssetsFunction = (assets) => Promise.resolve(assets.length > 0 ? assets : undefined);

export default processPickedAssetsSequentially;
