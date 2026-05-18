import {useEffect, useState} from 'react';
import {getTransactionDuplicateExitBackPath, getTransactionDuplicateRoute} from '@libs/Navigation/helpers/transactionDuplicateNavigation';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES, type DynamicRouteSuffix} from '@src/ROUTES';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, threadReportID: string) {
    const [nextScreen, setNextScreen] = useState<StepName>();
    const [prevScreen, setPrevScreen] = useState<StepName>();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element));

    useEffect(() => {
        if (currentScreenName === 'confirmation') {
            setPrevScreen(intersection.at(-1));
            return;
        }
        const currentIndex = intersection.indexOf(currentScreenName);
        const nextScreenIndex = currentIndex + 1;
        const prevScreenIndex = currentIndex - 1;
        setCurrentScreenIndex(currentIndex);
        setNextScreen(intersection.at(nextScreenIndex));
        setPrevScreen(prevScreenIndex !== -1 ? intersection.at(prevScreenIndex) : undefined);
    }, [currentScreenName, intersection]);

    const navigateToDuplicateRoute = (dynamicRouteSuffix: DynamicRouteSuffix) => {
        Navigation.navigate(getTransactionDuplicateRoute(dynamicRouteSuffix, threadReportID));
    };

    const goBackToDuplicateRoute = (dynamicRouteSuffix: DynamicRouteSuffix) => {
        Navigation.goBack(getTransactionDuplicateRoute(dynamicRouteSuffix, threadReportID), {compareParams: false});
    };

    const goBack = () => {
        switch (prevScreen) {
            case 'merchant':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.path);
                break;
            case 'category':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.path);
                break;
            case 'tag':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.path);
                break;
            case 'description':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.path);
                break;
            case 'taxCode':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.path);
                break;
            case 'reimbursable':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.path);
                break;
            case 'billable':
                goBackToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.path);
                break;
            default: {
                const reviewBackPath = getTransactionDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path, threadReportID);
                Navigation.goBack(getTransactionDuplicateExitBackPath(reviewBackPath), {compareParams: false});
                break;
            }
        }
    };

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.path);
                break;
            case 'category':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.path);
                break;
            case 'tag':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.path);
                break;
            case 'description':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.path);
                break;
            case 'taxCode':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.path);
                break;
            case 'reimbursable':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.path);
                break;
            case 'billable':
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.path);
                break;
            default:
                navigateToDuplicateRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path);
                break;
        }
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
