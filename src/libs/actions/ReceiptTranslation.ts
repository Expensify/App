import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReceiptTranslationState} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

function setReceiptTranslationState(transactionID: string, state: ReceiptTranslationState) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${transactionID}`, state);
}

/**
 * Translates a receipt into the viewer's language. The server saves the translation, even if the viewer leaves before it finishes.
 * Resolves with whether the request succeeded, so the caller can tell the viewer when it failed.
 */
function translateReceipt(transactionID: string): Promise<boolean> {
    setReceiptTranslationState(transactionID, {
        isTranslating: true,
        isShowingTranslation: true,
    });

    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TRANSLATE_RECEIPT, {transactionID})
        .then((response) => {
            if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                setReceiptTranslationState(transactionID, {
                    isTranslating: false,
                    isShowingTranslation: false,
                });
                return false;
            }
            setReceiptTranslationState(transactionID, {isTranslating: false});
            return true;
        })
        .catch(() => {
            setReceiptTranslationState(transactionID, {
                isTranslating: false,
                isShowingTranslation: false,
            });
            return false;
        });
}

function showReceiptTranslation(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: true});
}

function showOriginalReceipt(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: false});
}

export {translateReceipt, showReceiptTranslation, showOriginalReceipt};
