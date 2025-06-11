type MaskOnyxState = (data: Record<string, unknown>, isMaskingFragileDataEnabled?: boolean) => Record<string, unknown>;
type ReadFromOnyxDatabase = () => Promise<Record<string, unknown>>;
type ShareAsFile = (value: string) => void;

type ExportOnyxStateModule = {
    maskOnyxState: MaskOnyxState;
    readFromOnyxDatabase: ReadFromOnyxDatabase;
    shareAsFile: ShareAsFile;
};

export type {ExportOnyxStateModule, MaskOnyxState, ReadFromOnyxDatabase, ShareAsFile};
