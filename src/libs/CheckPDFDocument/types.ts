type CheckPDFDocument = {
    isValidPDF: (path: string) => Promise<void | boolean>;
};

export default CheckPDFDocument;
