import type {ReceiptSource} from '@src/types/onyx/Transaction';

type ReceiptStorage = {
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    overwrite: (durableName: string, uriOrPath: string, shouldAbort?: () => boolean) => Promise<string>;

    discard: (uriOrPath: string) => Promise<void>;

    locate: (source: ReceiptSource | null | undefined) => Promise<string | undefined>;

    settle: (durableName: string) => Promise<void>;

    recheckAfterSwap: (source: ReceiptSource | null | undefined) => Promise<boolean>;

    toLocalUri: (durableName: string) => string;

    /**
     * Claims a local source that is about to be stored in Onyx so resolve() will accept it this session.
     * No-op on native (files are durable). On web, object URLs die with the document.
     */
    retain: (source: string) => void;

    resolve: (source: ReceiptSource | null | undefined) => string | undefined;

    sweepLeftovers: () => Promise<void>;
};

export default ReceiptStorage;
