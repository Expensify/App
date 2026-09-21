import type {ReceiptSource} from '@src/types/onyx/Transaction';

type ReceiptStorage = {
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    overwrite: (durableName: string, uriOrPath: string, shouldAbort?: () => boolean) => Promise<string>;

    discard: (uriOrPath: string) => Promise<void>;

    locate: (source: ReceiptSource | null | undefined) => Promise<string | undefined>;

    settle: (durableName: string) => Promise<void>;

    toLocalUri: (durableName: string) => string;

    resolve: (source: ReceiptSource | null | undefined) => string | undefined;

    sweepLeftovers: () => Promise<void>;
};

export default ReceiptStorage;
