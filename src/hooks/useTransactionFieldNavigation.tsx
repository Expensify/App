import {useEffect, useMemo, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

type StepName = 'description' | 'merchant' | 'category' | 'billable' | 'tag' | 'taxCode' | 'reimbursable' | 'confirmation';

type RouteConfig = {
    base: {getRoute: (threadReportID: string, backTo?: string) => Route};
    merchant: {getRoute: (threadReportID: string, backTo?: string) => Route};
    category: {getRoute: (threadReportID: string, backTo?: string) => Route};
    tag: {getRoute: (threadReportID: string, backTo?: string) => Route};
    description: {getRoute: (threadReportID: string, backTo?: string) => Route};
    taxCode: {getRoute: (threadReportID: string, backTo?: string) => Route};
    reimbursable: {getRoute: (threadReportID: string, backTo?: string) => Route};
    billable: {getRoute: (threadReportID: string, backTo?: string) => Route};
    confirmation: {getRoute: (threadReportID: string, backTo?: string) => Route};
};

function useTransactionFieldNavigation(stepNames: string[], currentScreenName: StepName, threadReportID: string, routes: RouteConfig, backTo?: string) {
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
                Navigation.goBack(routes.merchant.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation.goBack(routes.category.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation.goBack(routes.tag.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation.goBack(routes.description.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation.goBack(routes.taxCode.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation.goBack(routes.reimbursable.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation.goBack(routes.billable.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation.goBack(routes.base.getRoute(threadReportID, backTo));
                break;
        }
    };

    const navigateToNextScreen = () => {
        switch (nextScreen) {
            case 'merchant':
                Navigation.navigate(routes.merchant.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation.navigate(routes.category.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation.navigate(routes.tag.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation.navigate(routes.description.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation.navigate(routes.taxCode.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation.navigate(routes.reimbursable.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation.navigate(routes.billable.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation.navigate(routes.confirmation.getRoute(threadReportID, backTo));
                break;
        }
    };

    return {navigateToNextScreen, goBack, currentScreenIndex};
}

export default useTransactionFieldNavigation;
export type {StepName, RouteConfig};

