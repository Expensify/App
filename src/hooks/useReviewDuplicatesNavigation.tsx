import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useEffect, useMemo, useState} from 'react';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, reportID: string) {
    const [nextScreen, setNextScreen] = useState<StepName>();
    const [prevScreen, setPrevScreen] = useState<StepName>();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = useMemo(() => CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element)), [stepNames]);

    // The review flow's dynamic routes are all built on top of the transaction thread report path.
    const reportPath = ROUTES.REPORT_WITH_ID.getRoute(reportID);

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

    const goBack = () => {
        switch (prevScreen) {
            case 'merchant':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_MERCHANT.path, reportPath));
                break;
            case 'category':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CATEGORY.path, reportPath));
                break;
            case 'tag':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAG.path, reportPath));
                break;
            case 'description':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_DESCRIPTION.path, reportPath));
                break;
            case 'taxCode':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAX_CODE.path, reportPath));
                break;
            case 'reimbursable':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REIMBURSABLE.path, reportPath));
                break;
            case 'billable':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_BILLABLE.path, reportPath));
                break;
            default:
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path, reportPath));
                break;
        }
    };

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_MERCHANT.path, reportPath));
                break;
            case 'category':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CATEGORY.path, reportPath));
                break;
            case 'tag':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAG.path, reportPath));
                break;
            case 'description':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_DESCRIPTION.path, reportPath));
                break;
            case 'taxCode':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAX_CODE.path, reportPath));
                break;
            case 'reimbursable':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REIMBURSABLE.path, reportPath));
                break;
            case 'billable':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_BILLABLE.path, reportPath));
                break;
            default:
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path, reportPath));
                break;
        }
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
