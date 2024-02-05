type Add = (reportActionID: string, path: string) => Promise<void>;
type Clear = (path: string) => Promise<void>;
type ClearAll = () => void;
type ClearByKey = (reportActionID: string) => void;

export type {Add, Clear, ClearAll, ClearByKey};
