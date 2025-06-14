import type {RouteConfig} from '@hooks/useTransactionFieldNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const mergeTransactionRoutes: RouteConfig = {
    base: ROUTES.TRANSACTION_MERGE_REVIEW_PAGE,
    merchant: ROUTES.TRANSACTION_MERGE_REVIEW_MERCHANT_PAGE,
    category: ROUTES.TRANSACTION_MERGE_REVIEW_CATEGORY_PAGE,
    tag: ROUTES.TRANSACTION_MERGE_REVIEW_TAG_PAGE,
    description: ROUTES.TRANSACTION_MERGE_REVIEW_DESCRIPTION_PAGE,
    taxCode: ROUTES.TRANSACTION_MERGE_REVIEW_TAX_CODE_PAGE,
    reimbursable: ROUTES.TRANSACTION_MERGE_REVIEW_REIMBURSABLE_PAGE,
    billable: ROUTES.TRANSACTION_MERGE_REVIEW_BILLABLE_PAGE,
    confirmation: ROUTES.TRANSACTION_MERGE_CONFIRMATION_PAGE,
};

type FieldReviewConfig = {
    routes: RouteConfig;
    setFieldAction: typeof setReviewDuplicatesKey;
    compareFields: typeof TransactionUtils.compareDuplicateTransactionFields;
    onyxKey: typeof ONYXKEYS.MERGE_TRANSACTION;
};

const mergeTransactionConfig: FieldReviewConfig = {
    routes: mergeTransactionRoutes,
    setFieldAction: setReviewDuplicatesKey,
    compareFields: TransactionUtils.compareDuplicateTransactionFields,
    onyxKey: ONYXKEYS.MERGE_TRANSACTION,
};

export default mergeTransactionConfig;
