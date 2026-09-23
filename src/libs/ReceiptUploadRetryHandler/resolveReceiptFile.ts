import type {ResolveReceiptFile} from './types';

/** Never called on web because `isRetrySupported` is false. It exists so `index.ts` can still import it. */
const resolveReceiptFile: ResolveReceiptFile = () => Promise.resolve(undefined);

export default resolveReceiptFile;
