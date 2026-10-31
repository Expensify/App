import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Locale from './Locale';
import type {ReceiptSource} from './Transaction';

/** One line of a translated receipt, in the order it is printed */
type TranslatedReceiptRow = {
    /** How the row is laid out */
    type: ValueOf<typeof CONST.RECEIPT.TRANSLATION_ROW_TYPE>;

    /** Alignment of a text row */
    align?: ValueOf<typeof CONST.RECEIPT.TRANSLATION_ROW_ALIGN>;

    /** Text of a text row, or the label or description on the left of the other rows */
    text?: string;

    /** Value or amount on the right, exactly as printed on the receipt */
    value?: string;

    /** Smaller gray line under an item's description */
    subtext?: string;
};

/** A receipt translated into one language */
type TranslatedReceipt = {
    /** Receipt source that was translated, so a replaced receipt is translated again */
    source: ReceiptSource;

    /** Every line of the receipt */
    rows: TranslatedReceiptRow[];
};

/** Translations of a transaction's receipt, saved on this device only */
type ReceiptTranslation = Partial<Record<Locale, TranslatedReceipt>>;

/** Session-scoped translate state for a transaction's receipt */
type ReceiptTranslationState = {
    /** Whether a translation request is in flight */
    isTranslating?: boolean;

    /** Whether the viewer chose to see the translation instead of the original */
    isShowingTranslation?: boolean;
};

export default ReceiptTranslation;
export type {TranslatedReceiptRow, ReceiptTranslationState};
