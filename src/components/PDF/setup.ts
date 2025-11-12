let pdfSetupPromise: Promise<unknown> | null = null;

function ensurePdfJsInitialized() {
    if (pdfSetupPromise) {
        return pdfSetupPromise;
    }

    pdfSetupPromise = Promise.all([
        import(/* webpackPrefetch: true */ 'react-pdf'),
        // eslint-disable-next-line import/extensions
        import(/* webpackPrefetch: true */ 'pdfjs-dist/build/pdf.worker.min.mjs'),
    ]).then(([reactPdfModule, pdfWorkerSource]) => {
        const {pdfjs} = reactPdfModule;

        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
        }

        return pdfjs;
    });

    return pdfSetupPromise;
}

// This hook makes it possible to manually load the lazy loaded modules
// right after the main bundle is loaded to decrease the bundle size
function usePreloadLazyModules() {
    import(/* webpackPrefetch: true */ 'react-fast-pdf');
    import(/* webpackPrefetch: true */ 'react-pdf');
}

export {ensurePdfJsInitialized, usePreloadLazyModules};
