import {useEffect, useMemo, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: StepName, threadReportID: string, backTo?: string) {
    const [nextScreen, setNextScreen] = useState<StepName>();
    const [prevScreen, setPrevScreen] = useState<StepName>();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = useMemo(() => CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element)), [stepNames]);

    useEffect(() => {
        if (currentScreenName === 'confirmation') {
            setPrevScreen(intersection[intersection.length - 1] ?? '');
            return;
        }
        const currentIndex = intersection.indexOf(currentScreenName);
        const nextScreenIndex = currentIndex + 1;
        const prevScreenIndex = currentIndex - 1;
        setCurrentScreenIndex(currentIndex);
        setNextScreen(intersection[nextScreenIndex] ?? '');
        setPrevScreen(intersection[prevScreenIndex] ?? '');
    }, [currentScreenName, intersection]);

    const goBack = () => {
        switch (prevScreen) {
            case 'merchant':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation.goBack(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadReportID, backTo));
                break;
        }
    };

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(threadReportID, backTo));
                break;
        }
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
