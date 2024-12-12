import React, {useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestRedirectToStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.START>;

function IOURequestRedirectToStartPage({
    route: {
        params: {iouType, iouRequestType},
    },
}: IOURequestRedirectToStartPageProps) {
    const isIouTypeValid = Object.values(CONST.IOU.TYPE).includes(iouType);
    const isIouRequestTypeValid = Object.values(CONST.IOU.REQUEST_TYPE).includes(iouRequestType);

    useEffect(() => {
        if (!isIouTypeValid || !isIouRequestTypeValid) {
            return;
        }

        // Dismiss this modal because the redirects below will open a new modal and there shouldn't be two modals stacked on top of each other.
        Navigation.dismissModal();

        // Redirect the person to the right start page using a rendom reportID
        const optimisticReportID = ReportUtils.generateReportID();
        if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        }

        // This useEffect should only run on mount which is why there are no dependencies being passed in the second parameter
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    if (!isIouTypeValid || !isIouRequestTypeValid) {
        return (
            <ScreenWrapper testID={IOURequestRedirectToStartPage.displayName}>
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return null;
}

IOURequestRedirectToStartPage.displayName = 'IOURequestRedirectToStartPage';

export default IOURequestRedirectToStartPage;
