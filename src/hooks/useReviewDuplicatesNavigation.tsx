import useDynamicBackPath from '@hooks/useDynamicBackPath';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useEffect, useMemo, useState} from 'react';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

// Maps each review step to the dynamic route suffix that lives at its URL, so the base path can be recovered from the active route.
const STEP_TO_DYNAMIC_ROUTE_SUFFIX: Record<StepName, DynamicRouteSuffix> = {
    merchant: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_MERCHANT.path,
    category: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CATEGORY.path,
    tag: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAG.path,
    description: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_DESCRIPTION.path,
    taxCode: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_TAX_CODE.path,
    reimbursable: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REIMBURSABLE.path,
    billable: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_BILLABLE.path,
    confirmation: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path,
};

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, reportID: string) {
    const [nextScreen, setNextScreen] = useState<StepName>();
    const [prevScreen, setPrevScreen] = useState<StepName>();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = useMemo(() => CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element)), [stepNames]);

    // Recover the base path (e.g. a search/expense RHP) from the current step's URL so every step keeps the launching context.
    // Fall back to the transaction thread report path when the suffix cannot be matched.
    const basePathFromRoute = useDynamicBackPath(STEP_TO_DYNAMIC_ROUTE_SUFFIX[currentScreenName]);
    const reportPath = basePathFromRoute || ROUTES.REPORT_WITH_ID.getRoute(reportID);

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
