import type {FileObject} from '@src/types/utils/Attachment';

/** Rebuilds the receipt file behind a failed upload so the original action can be dispatched again. Resolves undefined when the file is no longer on the device. */
type ResolveReceiptFile = (source: string, filename: string) => Promise<FileObject | undefined>;

/** Whether the receipt file behind a failed upload is still reachable, and therefore whether a retry can succeed. */
type CanRetryReceipt = (source: string | undefined) => Promise<boolean>;

export type {CanRetryReceipt, ResolveReceiptFile};
