let pdfSetupPromise: Promise<unknown> | null = null;

// Export a function that returns a promise ensuring pdfjs is initialized
function ensurePdfJsInitialized() {
    if (!pdfSetupPromise) {
        pdfSetupPromise = Promise.all([
            import(/* webpackPreload: true */ 'react-pdf'),
            // eslint-disable-next-line import/extensions
            import(/* webpackPreload: true */ 'pdfjs-dist/build/pdf.worker.min.mjs'),
        ]).then(([reactPdfModule, pdfWorkerSource]) => {
            const {pdfjs} = reactPdfModule;

            if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
            }

            return pdfjs;
        });
    }

    return pdfSetupPromise;
}

export default ensurePdfJsInitialized;
