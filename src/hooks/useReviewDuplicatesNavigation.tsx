import duplicateReviewConfig from '@pages/TransactionReview/Duplicates/duplicateReviewConfig';
import useTransactionFieldNavigation from './useTransactionFieldNavigation';
import type {StepName} from './useTransactionFieldNavigation';

function useReviewDuplicatesNavigation(stepNames: StepName[], currentScreenName: StepName, threadReportID: string, backTo?: string) {
    return useTransactionFieldNavigation(stepNames, currentScreenName, threadReportID, duplicateReviewConfig.routes, backTo);
}

export default useReviewDuplicatesNavigation;
