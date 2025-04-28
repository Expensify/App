type OnFileCreation = (source: string) => void;

type SetTestDriveReceiptAndNavigate = (filename: string, onFileCreation: OnFileCreation) => void;

// eslint-disable-next-line import/prefer-default-export
export type {SetTestDriveReceiptAndNavigate};
