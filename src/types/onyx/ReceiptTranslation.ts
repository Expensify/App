import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Locale from './Locale';

/** One line of a translated receipt, in the order it is printed */
type TranslatedReceiptRow = {
    /** How the row is laid out */
    type: ValueOf<typeof CONST.RECEIPT.TRANSLATION_ROW_TYPE>;

    /** Alignment of a heading or text row */
    align?: ValueOf<typeof CONST.RECEIPT.TRANSLATION_ROW_ALIGN>;

    /** Text of a heading or text row */
    text?: string;

    /** Label or description on the left of the other rows */
    left?: string;

    /** Value or amount on the right, exactly as printed on the receipt */
    right?: string;

    /** Smaller gray line under an item's description */
    detail?: string;

    /** Whether the text row is shown as printed because its translation could not be checked */
    isOriginal?: boolean;
};

/** A receipt translated into one language */
type TranslatedReceipt = {
    /** Receipt that was translated, so a replaced receipt is translated again */
    receiptID: number;

    /** Whether the receipt could be translated */
    state: ValueOf<typeof CONST.RECEIPT.TRANSLATION_STATE>;

    /** Language the receipt was printed in */
    sourceLanguage?: string;

    /** Every line of the receipt, only filled when it was translated */
    rows?: TranslatedReceiptRow[];
};

/** Translations of a transaction's receipt, keyed by the viewer's locale */
type ReceiptTranslation = Partial<Record<Locale, TranslatedReceipt>>;

/** Session-scoped translate state for a transaction's receipt */
type ReceiptTranslationState = {
    /** Where the latest translation request is in its lifecycle */
    requestState?: ValueOf<typeof CONST.RECEIPT.TRANSLATION_REQUEST_STATE>;

    /** Whether the viewer chose to see the translation instead of the original */
    isShowingTranslation?: boolean;
};

export default ReceiptTranslation;
export type {TranslatedReceiptRow, ReceiptTranslationState};
