import {duplicateReviewRoutes} from '@pages/TransactionDuplicate/duplicateReviewConfig';
import useTransactionFieldNavigation from './useTransactionFieldNavigation';
import type {StepName} from './useTransactionFieldNavigation';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, threadReportID: string, backTo?: string) {
    return useTransactionFieldNavigation(stepNames, currentScreenName, threadReportID, duplicateReviewRoutes, backTo);
}

export default useReviewDuplicatesNavigation;
