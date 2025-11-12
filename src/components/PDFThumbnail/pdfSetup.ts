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

export default ensurePdfJsInitialized;
