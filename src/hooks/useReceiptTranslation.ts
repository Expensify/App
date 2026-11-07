import {showOriginalReceipt, showReceiptTranslation, translateReceipt} from '@libs/actions/ReceiptTranslation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Growl from '@libs/Growl';
import {hasReceiptSource} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useReceiptTranslation(transaction: OnyxEntry<Transaction>) {
    const {translate, preferredLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const transactionID = transaction?.transactionID;
    const [receiptTranslation] = useOnyx(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const [receiptTranslationState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${getNonEmptyStringOnyxID(transactionID)}`);

    const locale = preferredLocale ?? CONST.LOCALES.DEFAULT;
    const receiptID = transaction?.receipt?.receiptID;
    const savedTranslation = receiptTranslation?.[locale];

    // The server sends the transaction's receiptID as a string but the translation's as a number
    const isSameReceipt = !!receiptID && !!savedTranslation && String(savedTranslation.receiptID) === String(receiptID);
    const savedTranslationRows = isSameReceipt && savedTranslation.state === CONST.RECEIPT.TRANSLATION_STATE.TRANSLATED ? savedTranslation.rows : undefined;
    const isTranslating = !!receiptTranslationState?.isTranslating;
    const translatedReceiptRows = receiptTranslationState?.isShowingTranslation && !isTranslating ? savedTranslationRows : undefined;

    const startTranslation = () => {
        if (!transactionID || !receiptID) {
            return;
        }
        if (savedTranslationRows) {
            showReceiptTranslation(transactionID);
            return;
        }
        translateReceipt(transactionID).then((isSuccessful) => {
            if (!isSuccessful) {
                Growl.error({bodyText: translate('receipt.translationError.generic')});
                return;
            }
            Onyx.get(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATIONS}${transactionID}`).then((translation) => {
                const state = translation?.[locale]?.state;
                if (state !== CONST.RECEIPT.TRANSLATION_STATE.UNREADABLE && state !== CONST.RECEIPT.TRANSLATION_STATE.ALREADY_IN_LANGUAGE) {
                    return;
                }
                showOriginalReceipt(transactionID);
                Growl.error({bodyText: translate(`receipt.translationError.${state}`)});
            });
        });
    };

    const showOriginal = () => {
        if (!transactionID) {
            return;
        }
        showOriginalReceipt(transactionID);
    };

    return {
        canTranslate: isBetaEnabled(CONST.BETAS.RECEIPT_TRANSLATION) && hasReceiptSource(transaction),
        isTranslateDisabled: isOffline || isTranslating || !receiptID || !!transaction?.pendingFields?.receipt,
        isTranslating,
        translatedReceiptRows,
        startTranslation,
        showOriginal,
    };
}

export default useReceiptTranslation;
