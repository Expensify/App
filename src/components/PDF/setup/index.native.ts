// This import is necesssary as the native apps use some files from the react-pdf library
// and won't work without it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Document} from 'react-pdf';
import type {PDFSetupPromise, UsePreloadLazyModules} from './types';

function ensurePdfJsInitialized(): PDFSetupPromise {
    return Promise.resolve();
}

function usePreloadLazyModules(): UsePreloadLazyModules {}

export {ensurePdfJsInitialized, usePreloadLazyModules};
