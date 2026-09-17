import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import {useEffect, useMemo, useState} from 'react';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, threadReportID: string, backTo?: string) {
    const [nextScreen, setNextScreen] = useState<StepName>();
    const [prevScreen, setPrevScreen] = useState<StepName>();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = useMemo(() => CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element)), [stepNames]);

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
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.getRoute(threadReportID)));
                break;
            case 'category':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.getRoute(threadReportID)));
                break;
            case 'tag':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.getRoute(threadReportID)));
                break;
            case 'description':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.getRoute(threadReportID)));
                break;
            case 'taxCode':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.getRoute(threadReportID)));
                break;
            case 'reimbursable':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.getRoute(threadReportID)));
                break;
            case 'billable':
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.getRoute(threadReportID)));
                break;
            default:
                if (backTo) {
                    Navigation.goBack(backTo as Route);
                    return;
                }
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.getRoute(threadReportID)));
                break;
        }
    };

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.getRoute(threadReportID)));
                break;
            case 'category':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.getRoute(threadReportID)));
                break;
            case 'tag':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.getRoute(threadReportID)));
                break;
            case 'description':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.getRoute(threadReportID)));
                break;
            case 'taxCode':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.getRoute(threadReportID)));
                break;
            case 'reimbursable':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.getRoute(threadReportID)));
                break;
            case 'billable':
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.getRoute(threadReportID)));
                break;
            default:
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.getRoute(threadReportID)));
                break;
        }
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
