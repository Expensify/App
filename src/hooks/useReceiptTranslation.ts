import {showOriginalReceipt, showReceiptTranslation, translateReceipt} from '@libs/actions/ReceiptTranslation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Growl from '@libs/Growl';
import {hasReceiptSource} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useReceiptTranslation(transaction: OnyxEntry<Transaction>) {
    const {translate, preferredLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const transactionID = transaction?.transactionID;
    const [receiptTranslation] = useOnyx(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [receiptTranslationState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${getNonEmptyStringOnyxID(transactionID)}`);

    const locale = preferredLocale ?? CONST.LOCALES.DEFAULT;
    const receiptSource = transaction?.receipt?.source;
    const savedTranslation = receiptTranslation?.[locale];
    const savedTranslationRows = !!receiptSource && savedTranslation?.source === receiptSource ? savedTranslation.rows : undefined;
    const isTranslating = !!receiptTranslationState?.isTranslating;
    const translatedReceiptRows = receiptTranslationState?.isShowingTranslation && !isTranslating ? savedTranslationRows : undefined;

    const startTranslation = () => {
        if (!transactionID || !receiptSource) {
            return;
        }
        if (savedTranslationRows) {
            showReceiptTranslation(transactionID);
            return;
        }
        translateReceipt(transactionID, receiptSource, locale).then((error) => {
            if (!error) {
                return;
            }
            Growl.error({bodyText: translate(`receipt.translationError.${error}`)});
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
        isTranslateDisabled: isOffline || isTranslating || !!transaction?.pendingFields?.receipt,
        isTranslating,
        translatedReceiptRows,
        startTranslation,
        showOriginal,
    };
}

export default useReceiptTranslation;
