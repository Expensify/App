type Add = (id: string, path: string) => Promise<void | void[]>;
type Clear = (path: string) => Promise<void>;
type ClearByKey = (id: string) => void;

export type {Add, Clear, ClearByKey};
