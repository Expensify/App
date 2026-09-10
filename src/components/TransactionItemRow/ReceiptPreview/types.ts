import type {AnchorPosition} from '@components/TransactionItemRow/types';

import type {Transaction} from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

type ReceiptPreviewProps = {
    /** Path to the image to be opened in the preview */
    source: ReceiptSource;

    /** Whether the preview should be shown (e.g. if we are hovered over certain ReceiptCell) */
    hovered: boolean;

    /** Is preview for an e-receipt */
    isEReceipt: boolean;

    /** Transaction object related to the preview */
    transactionItem: Transaction;

    /** Window position of the hovered cell. When set, the preview is anchored to the right of the row instead of the fixed upper-left corner. */
    anchorPosition?: AnchorPosition;
};

export default ReceiptPreviewProps;
