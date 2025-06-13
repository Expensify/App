import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RouteConfig} from '@hooks/useTransactionFieldNavigation';
import {duplicateReviewRoutes} from './duplicateReviewConfig';

export type FieldReviewConfig = {
    routes: RouteConfig;
    onyxKey: string;
    setFieldAction: typeof setReviewDuplicatesKey;
    comparisonFunction: typeof TransactionUtils.compareDuplicateTransactionFields;
    titleTranslationKey: string;
};

export const duplicateFieldConfig: FieldReviewConfig = {
    routes: duplicateReviewRoutes,
    onyxKey: ONYXKEYS.REVIEW_DUPLICATES,
    setFieldAction: setReviewDuplicatesKey,
    comparisonFunction: TransactionUtils.compareDuplicateTransactionFields,
    titleTranslationKey: 'iou.reviewDuplicates',
};

// Field-specific option generators
export const fieldOptionGenerators = {
    category: (categories: (string | undefined)[], translate: (key: string) => string) =>
        categories.map((category) =>
            !category
                ? {text: translate('violations.none'), value: ''}
                : {text: category, value: category}
        ),
    
    merchant: (merchants: (string | undefined)[], translate: (key: string) => string) =>
        merchants.map((merchant) =>
            !merchant
                ? {text: translate('violations.none'), value: ''}
                : {text: merchant, value: merchant}
        ),
    
    tag: (tags: (string | undefined)[], translate: (key: string) => string) =>
        tags.map((tag) =>
            !tag
                ? {text: translate('violations.none'), value: ''}
                : {text: PolicyUtils.getCleanedTagName(tag), value: tag}
        ),
    
    reimbursable: (reimbursableValues: (boolean | undefined)[], translate: (key: string) => string) =>
        reimbursableValues.map((reimbursable) => ({
            text: reimbursable ? translate('common.yes') : translate('common.no'),
            value: reimbursable ?? false,
        })),
    
    billable: (billableValues: (boolean | undefined)[], translate: (key: string) => string) =>
        billableValues.map((billable) => ({
            text: billable ? translate('common.yes') : translate('common.no'),
            value: billable ?? false,
        })),
};

// Field label translation keys
export const fieldLabels = {
    category: 'violations.categoryToKeep',
    merchant: 'violations.merchantToKeep', 
    tag: 'violations.tagToKeep',
    reimbursable: 'violations.isTransactionReimbursable',
    billable: 'violations.isTransactionBillable',
    taxCode: 'violations.taxCodeToKeep',
    description: 'violations.descriptionToKeep',
}; 