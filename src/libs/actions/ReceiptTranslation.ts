import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReceiptTranslation, ReceiptTranslationState} from '@src/types/onyx';
import type Locale from '@src/types/onyx/Locale';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function setReceiptTranslationState(transactionID: string, state: ReceiptTranslationState) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${transactionID}`, state);
}

/**
 * Translates a receipt into the viewer's language. The server saves the translation, even if the viewer leaves before it finishes.
 * Resolves with the state the server sent for the viewer's locale, or undefined when the request failed, so the caller can tell the viewer why.
 */
function translateReceipt(transactionID: string, locale: Locale): Promise<ValueOf<typeof CONST.RECEIPT.TRANSLATION_STATE> | undefined> {
    setReceiptTranslationState(transactionID, {
        isTranslating: true,
        isShowingTranslation: true,
    });

    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TRANSLATE_RECEIPT, {transactionID})
        .then((response) => {
            const translationKey = `${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATIONS}${transactionID}` as const;
            const translation = response?.onyxData?.find((update): update is OnyxUpdate<typeof translationKey> & {value: ReceiptTranslation} => update.key === translationKey)?.value;
            const state = response?.jsonCode === CONST.JSON_CODE.SUCCESS ? translation?.[locale]?.state : undefined;
            setReceiptTranslationState(transactionID, {
                isTranslating: false,
                isShowingTranslation: state === CONST.RECEIPT.TRANSLATION_STATE.TRANSLATED,
            });
            return state;
        })
        .catch(() => {
            setReceiptTranslationState(transactionID, {
                isTranslating: false,
                isShowingTranslation: false,
            });
            return undefined;
        });
}

function showReceiptTranslation(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: true});
}

function showOriginalReceipt(transactionID: string) {
    setReceiptTranslationState(transactionID, {isShowingTranslation: false});
}

export {translateReceipt, showReceiptTranslation, showOriginalReceipt};
