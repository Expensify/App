import {useEffect, useMemo, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function useReviewDuplicatesNavigation(stepNames: string[], currentScreenName: string, threadReportID: string) {
    const [nextScreen, setNextScreen] = useState(currentScreenName);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const intersection = useMemo(() => CONST.REVIEW_DUPLICATES_ORDER.filter((element) => stepNames.includes(element)), [stepNames]);

    useEffect(() => {
        const currentIndex = intersection.indexOf(currentScreenName);
        const nextScreenIndex = currentIndex + 1;
        setCurrentScreenIndex(currentIndex);
        setNextScreen(intersection[nextScreenIndex] ?? currentScreenName);
    }, [currentScreenName, intersection]);

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(threadReportID));
                break;
            case 'category':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(threadReportID));
                break;
            case 'tag':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(threadReportID));
                break;

            case 'description':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(threadReportID));
                break;
            case 'taxCode':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(threadReportID));
                break;

            case 'reimbursable':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(threadReportID));
                break;
            case 'billable':
                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(threadReportID));
                break;
            default:
                //   Navigation.navigate(CONST.SCREENS.TRANSACTION_DUPLICATE.REVIEW_CATEGORY);
                break;
        }
    };

    return {navigateToNextScreen, currentScreenIndex};
}

export default useReviewDuplicatesNavigation;
