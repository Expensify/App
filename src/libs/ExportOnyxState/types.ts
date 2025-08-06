import type OnyxState from '@src/types/onyx/OnyxState';

type MaskOnyxState = (data: OnyxState, isMaskingFragileDataEnabled?: boolean) => OnyxState;
type ReadFromOnyxDatabase = () => Promise<OnyxState>;
type ShareAsFile = (value: string) => void;

type ExportOnyxStateModule = {
    maskOnyxState: MaskOnyxState;
    readFromOnyxDatabase: ReadFromOnyxDatabase;
    shareAsFile: ShareAsFile;
};

export type {ExportOnyxStateModule, MaskOnyxState, ReadFromOnyxDatabase, ShareAsFile};
