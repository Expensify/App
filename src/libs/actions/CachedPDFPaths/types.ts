type Add = (id: string, path: string) => Promise<void>;
type Clear = (path: string) => Promise<void>;
type ClearAll = () => void;
type ClearByKey = (id: string) => void;

export type {Add, Clear, ClearAll, ClearByKey};
