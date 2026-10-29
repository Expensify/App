import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale, ReceiptTranslationState} from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function setReceiptTranslationState(transactionID: string, state: ReceiptTranslationState) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${transactionID}`, state);
}

function getTranslationError(translationError: string | undefined): ValueOf<typeof CONST.RECEIPT.TRANSLATION_ERROR> {
    if (translationError === CONST.RECEIPT.TRANSLATION_ERROR.UNREADABLE || translationError === CONST.RECEIPT.TRANSLATION_ERROR.SAME_LANGUAGE) {
        return translationError;
    }
    return CONST.RECEIPT.TRANSLATION_ERROR.GENERIC;
}

/**
 * Translates a receipt into the viewer's language and saves it on this device, even if the viewer leaves before it finishes.
 * Resolves with the reason it failed, so the caller can tell the viewer.
 */
function translateReceipt(transactionID: string, source: ReceiptSource, locale: Locale): Promise<ValueOf<typeof CONST.RECEIPT.TRANSLATION_ERROR> | undefined> {
    setReceiptTranslationState(transactionID, {
        isTranslating: true,
        isShowingTranslation: true,
    });

    // The translation is saved on this device only, so the client writes the response to Onyx instead of the server
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TRANSLATE_RECEIPT, {transactionID, locale})
        .then((response) => {
            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS || !response.translatedReceiptRows) {
                setReceiptTranslationState(transactionID, {
                    isTranslating: false,
                    isShowingTranslation: false,
                });
                return getTranslationError(response?.translationError);
            }
            Onyx.merge(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATION}${transactionID}`, {
                [locale]: {source, rows: response.translatedReceiptRows},
            });
            setReceiptTranslationState(transactionID, {isTranslating: false});
            return undefined;
        })
        .catch(() => {
            setReceiptTranslationState(transactionID, {
                isTranslating: false,
                isShowingTranslation: false,
            });
            return CONST.RECEIPT.TRANSLATION_ERROR.GENERIC;
        });
}

function showReceiptTranslation(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: true});
}

function showOriginalReceipt(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: false});
}

export {translateReceipt, showReceiptTranslation, showOriginalReceipt};
