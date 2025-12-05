import {useEffect} from 'react';
import {cancelIdle, requestIdle} from './requestIdle';
import type {PDFSetupPromise, UsePreloadLazyModules} from './types';

let pdfSetupPromise: PDFSetupPromise = null;

function ensurePdfJsInitialized(): PDFSetupPromise {
    if (pdfSetupPromise) {
        return pdfSetupPromise;
    }

    pdfSetupPromise = Promise.all([
        import(/* webpackPrefetch: true */ 'react-pdf'),
        // eslint-disable-next-line import/extensions
        import(/* webpackPrefetch: true */ 'pdfjs-dist/build/pdf.worker.min.mjs'),
    ])
        .then(([reactPdfModule, pdfWorkerSource]) => {
            const {pdfjs} = reactPdfModule;

            if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
            }

            return pdfjs;
        })
        .catch((err) => {
            pdfSetupPromise = null;
            throw err;
        });

    return pdfSetupPromise;
}

// This hook makes it possible to manually load the lazy loaded modules
// right after the main bundle is loaded to decrease the bundle size
function usePreloadLazyModules(): UsePreloadLazyModules {
    useEffect(() => {
        const id = requestIdle(() => {
            import(/* webpackPrefetch: true */ 'react-fast-pdf');
            import(/* webpackPrefetch: true */ 'react-pdf');
        });

        return () => cancelIdle(id);
    }, []);
}

export {ensurePdfJsInitialized, usePreloadLazyModules};
