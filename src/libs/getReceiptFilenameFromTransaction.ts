import type {Transaction} from '@src/types/onyx';

export default function getReceiptFilenameFromTransaction(transaction: Transaction | Partial<Transaction> | undefined): string | undefined {
    // Use ||, not ?? since we want empty string to fallback to the legacy transaction.filename
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return transaction?.receipt?.filename || transaction?.filename;
}
