type Add = (id: string, path: string, pdfPaths: Record<string, string>) => Promise<void | void[]>;
type Clear = (path: string) => Promise<void>;
type ClearByKey = (id: string, pdfPaths: Record<string, string>) => void;

export type {Add, Clear, ClearByKey};
