import type {EnsurePdfJsInitialized, UsePreloadLazyModules} from './types';

function ensurePdfJsInitialized(): EnsurePdfJsInitialized {
    return Promise.resolve();
}

function usePreloadLazyModules(): UsePreloadLazyModules {}

export {ensurePdfJsInitialized, usePreloadLazyModules};
