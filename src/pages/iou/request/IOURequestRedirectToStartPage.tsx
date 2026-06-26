import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {clearMoneyRequest} from '@userActions/IOU/MoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestRedirectToStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.START>;

function IOURequestRedirectToStartPage({route}: IOURequestRedirectToStartPageProps) {
    const {iouType, iouRequestType} = route.params ?? {};
    const isIouTypeValid = Object.values(CONST.IOU.TYPE).includes(iouType);
    const isIouRequestTypeValid = Object.values(CONST.IOU.REQUEST_TYPE).includes(iouRequestType);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    useEffect(() => {
        if (!isIouTypeValid || !isIouRequestTypeValid) {
            return;
        }

        // This page is the entry point for launcher quick-action deeplinks (e.g. the home-screen "Scan receipt" /
        // "Track distance" shortcuts). Unlike the FAB, it never goes through startMoneyRequest, so a previous
        // shortcut's draft survives under OPTIMISTIC_TRANSACTION_ID. A leftover "scan" draft has no
        // `comment.waypoints`, and the distance start page only shows placeholder waypoints locally without
        // writing them back, so tapping a waypoint opens the "Not here" page. Clear the stale draft here
        // (mirroring startMoneyRequest) so the destination start page rebuilds a fresh draft with the correct
        // shape — including the distance start/stop waypoints. The OPTIMISTIC_TRANSACTION_ID fallback covers the
        // cold-start case where the draft collection has not hydrated yet and the selector is still empty (#88183).
        clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs ?? [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]);

        // Dismiss this modal because the redirects below will open a new modal and there shouldn't be two modals stacked on top of each other.
        Navigation.dismissModal();

        // Redirect the person to the right start page using a random reportID
        const optimisticReportID = generateReportID();
        if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP) {
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL) {
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS) {
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.TIME) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_TIME.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        }

        // This useEffect should only run on mount which is why there are no dependencies being passed in the second parameter
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isIouTypeValid || !isIouRequestTypeValid) {
        return (
            <ScreenWrapper testID="IOURequestRedirectToStartPage">
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return null;
}

export default IOURequestRedirectToStartPage;
