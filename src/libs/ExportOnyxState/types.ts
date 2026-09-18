import type OnyxState from '@src/types/onyx/OnyxState';

type MaskOnyxState = (data: OnyxState, isMaskingFragileDataEnabled?: boolean) => OnyxState;
type ReadOnyxState = () => Promise<OnyxState>;
type ShareAsFile = (value: string) => Promise<void>;

type ExportOnyxStateModule = {
    maskOnyxState: MaskOnyxState;
    readOnyxState: ReadOnyxState;
    shareAsFile: ShareAsFile;
};

export type {ExportOnyxStateModule, MaskOnyxState, ReadOnyxState, ShareAsFile};
