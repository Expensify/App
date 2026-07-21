import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useEffect, useMemo, useState} from 'react';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

const STEP_TO_DYNAMIC_SUFFIX = {
    merchant: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.path,
    category: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.path,
    tag: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.path,
    description: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.path,
    taxCode: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.path,
    reimbursable: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.path,
    billable: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.path,
    confirmation: DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path,
} as const satisfies Record<StepName, string>;

/**
 * @param backPath - The base path (the report the wizard is opened on top of, i.e. the current URL minus the dynamic suffix).
 */
function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, backPath: string) {
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
        if (prevScreen) {
            Navigation.goBack(createDynamicRoute(STEP_TO_DYNAMIC_SUFFIX[prevScreen], backPath));
            return;
        }
        Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path, backPath));
    };

    const navigateToNextScreen = () => {
        const targetSuffix = nextScreen ? STEP_TO_DYNAMIC_SUFFIX[nextScreen] : DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path;
        Navigation.navigate(createDynamicRoute(targetSuffix, backPath));
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
