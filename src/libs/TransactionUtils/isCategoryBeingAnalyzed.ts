import {isCategoryMissing} from '@libs/CategoryUtils';
import {isInvoiceReport} from '@libs/ReportTypeAndStatus';

import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getCategory, isExpenseUnreported, isMerchantMissing} from './fields';

/**
 * Check if category is being analyzed (manual request creation or auto-categorization grace period)
 */
function isCategoryBeingAnalyzed(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>): boolean {
    if (!transaction) {
        return false;
    }

    if (policy?.autoCategorizeNewExpenses === false) {
        return false;
    }

    if (isExpenseUnreported(transaction)) {
        return false;
    }

    // Only consider analyzing if category is actually missing
    const category = getCategory(transaction);
    if (!isCategoryMissing(category)) {
        return false;
    }

    // Don't consider partial transactions (empty merchant and zero amount) as analyzing
    if (isMerchantMissing(transaction) && transaction.amount === 0) {
        return false;
    }

    // Invoice expense is not auto-categorized
    if (isInvoiceReport(report)) {
        return false;
    }

    const pendingAction = transaction.pendingAction;
    const pendingAutoCategorizationTime = transaction.comment?.pendingAutoCategorizationTime;

    // Check if manual request is being created
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        return transaction.wasAutoCategorizeEnabledOnCreation !== false;
    }

    // Check if within auto-categorization grace period
    if (pendingAutoCategorizationTime && typeof pendingAutoCategorizationTime === 'string') {
        const pendingTime = new Date(`${pendingAutoCategorizationTime.replace(' ', 'T')}Z`);
        if (!Number.isNaN(pendingTime.getTime())) {
            const currentTime = new Date();
            const elapsedMs = currentTime.getTime() - pendingTime.getTime();
            const oneMinuteMs = 60 * 1000;
            return elapsedMs < oneMinuteMs;
        }
    }

    return false;
}

export default isCategoryBeingAnalyzed;
