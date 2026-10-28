import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale, ReceiptTranslationState} from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

function setReceiptTranslationState(transactionID: string, state: ReceiptTranslationState) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${transactionID}`, state);
}

function getTranslationError(translationError: string | undefined): NonNullable<ReceiptTranslationState['error']> {
    if (translationError === CONST.RECEIPT.TRANSLATION_ERROR.UNREADABLE || translationError === CONST.RECEIPT.TRANSLATION_ERROR.SAME_LANGUAGE) {
        return translationError;
    }
    return CONST.RECEIPT.TRANSLATION_ERROR.GENERIC;
}

/**
 * Translates a receipt into the viewer's language and saves it on this device, even if the viewer leaves before it finishes.
 */
function translateReceipt(transactionID: string, source: ReceiptSource, locale: Locale) {
    setReceiptTranslationState(transactionID, {
        isTranslating: true,
        isShowingTranslation: true,
        error: null,
    });

    // The translation is saved on this device only, so the client writes the response to Onyx instead of the server
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TRANSLATE_RECEIPT, {transactionID, locale})
        .then((response) => {
            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS || !response.translatedReceiptRows) {
                setReceiptTranslationState(transactionID, {
                    isTranslating: false,
                    isShowingTranslation: false,
                    error: getTranslationError(response?.translationError),
                });
                return;
            }
            Onyx.merge(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATION}${transactionID}`, {
                [locale]: {source, rows: response.translatedReceiptRows},
            });
            setReceiptTranslationState(transactionID, {isTranslating: false});
        })
        .catch(() => {
            setReceiptTranslationState(transactionID, {
                isTranslating: false,
                isShowingTranslation: false,
                error: CONST.RECEIPT.TRANSLATION_ERROR.GENERIC,
            });
        });
}

function showReceiptTranslation(transactionID: string) {
    setReceiptTranslationState(transactionID, {
        isShowingTranslation: true,
        error: null,
    });
}

function showOriginalReceipt(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: false, error: null});
}

export {translateReceipt, showReceiptTranslation, showOriginalReceipt};
