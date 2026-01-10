import type {PDFSetupPromise, UsePreloadLazyModules} from './types';

function ensurePdfJsInitialized(): PDFSetupPromise {
    return Promise.resolve();
}

function usePreloadLazyModules(): UsePreloadLazyModules {}

export {ensurePdfJsInitialized, usePreloadLazyModules};
