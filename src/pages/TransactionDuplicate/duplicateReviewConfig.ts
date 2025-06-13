import type {RouteConfig} from '@hooks/useTransactionFieldNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const duplicateReviewRoutes: RouteConfig = {
    base: ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE,
    merchant: ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE,
    category: ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE,
    tag: ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE,
    description: ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE,
    taxCode: ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE,
    reimbursable: ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE,
    billable: ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE,
    confirmation: ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE,
};

type FieldReviewConfig = {
    routes: RouteConfig;
    setFieldAction: typeof setReviewDuplicatesKey;
    compareFields: typeof TransactionUtils.compareDuplicateTransactionFields;
    onyxKey: typeof ONYXKEYS.REVIEW_DUPLICATES;
};

const duplicateReviewConfig: FieldReviewConfig = {
    routes: duplicateReviewRoutes,
    setFieldAction: setReviewDuplicatesKey,
    compareFields: TransactionUtils.compareDuplicateTransactionFields,
    onyxKey: ONYXKEYS.REVIEW_DUPLICATES,
};

export default duplicateReviewConfig;
