import type {OnyxKey} from 'react-native-onyx';
import type {RouteConfig} from '@hooks/useTransactionFieldNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import duplicateReviewRoutes from './duplicateReviewConfig';

type FieldReviewConfig = {
    routes: RouteConfig;
    onyxKey: OnyxKey;
    setFieldAction: typeof setReviewDuplicatesKey;
    compareFields: typeof TransactionUtils.compareDuplicateTransactionFields;
};

const duplicateFieldConfig: FieldReviewConfig = {
    routes: duplicateReviewRoutes,
    onyxKey: ONYXKEYS.REVIEW_DUPLICATES,
    setFieldAction: setReviewDuplicatesKey,
    compareFields: TransactionUtils.compareDuplicateTransactionFields,
};

// Field-specific option generators
const fieldOptionGenerators = {
    category: (categories: Array<string | undefined>, translate: (key: string) => string) =>
        categories.map((category) => (!category ? {text: translate('violations.none'), value: ''} : {text: category, value: category})),

    merchant: (merchants: Array<string | undefined>, translate: (key: string) => string) =>
        merchants.map((merchant) => (!merchant ? {text: translate('violations.none'), value: ''} : {text: merchant, value: merchant})),

    tag: (tags: Array<string | undefined>, translate: (key: string) => string) =>
        tags.map((tag) => (!tag ? {text: translate('violations.none'), value: ''} : {text: PolicyUtils.getCleanedTagName(tag), value: tag})),

    reimbursable: (reimbursableValues: Array<boolean | undefined>, translate: (key: string) => string) =>
        reimbursableValues.map((reimbursable) => ({
            text: reimbursable ? translate('common.yes') : translate('common.no'),
            value: reimbursable ?? false,
        })),

    billable: (billableValues: Array<boolean | undefined>, translate: (key: string) => string) =>
        billableValues.map((billable) => ({
            text: billable ? translate('common.yes') : translate('common.no'),
            value: billable ?? false,
        })),
};

// Field label translation keys
const fieldLabels = {
    category: 'violations.categoryToKeep',
    merchant: 'violations.merchantToKeep',
    tag: 'violations.tagToKeep',
    reimbursable: 'violations.isTransactionReimbursable',
    billable: 'violations.isTransactionBillable',
    taxCode: 'violations.taxCodeToKeep',
    description: 'violations.descriptionToKeep',
};

export type {FieldReviewConfig};
export {duplicateFieldConfig, fieldOptionGenerators, fieldLabels};
