type CheckPDFDocument = {
    isValidPDF: (path: string, callback?: (isCorrect: boolean) => void) => Promise<void | boolean>;
};

export default CheckPDFDocument;
