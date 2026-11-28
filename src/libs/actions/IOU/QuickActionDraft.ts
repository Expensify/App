import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

// These match clearMoneyRequest() and clearMoneyRequestAmount() in ./MoneyRequest for OPTIMISTIC_TRANSACTION_ID. They
// live in their own module because the deep link subscriber in linkingConfig calls them, and importing ./MoneyRequest
// there creates a circular import (MoneyRequest -> Navigation -> linkingConfig). Keep this file free of heavy imports.

/**
 * Removes the quick-action draft so the create screen builds a fresh one.
 */
function clearQuickActionDraft() {
    Onyx.multiSet({
        [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}` as const]: null,
        [`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}` as const]: false,
    });
}

/**
 * Resets the amount on the quick-action draft without removing the rest of it.
 */
function clearQuickActionDraftAmount() {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
        amount: 0,
        isAmountSet: false,
    });
}

export {clearQuickActionDraft, clearQuickActionDraftAmount};
