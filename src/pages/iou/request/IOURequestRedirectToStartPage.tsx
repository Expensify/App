import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {isDistanceExpenseType} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useRef} from 'react';

import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestRedirectToStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.START>;

function IOURequestRedirectToStartPage({route}: IOURequestRedirectToStartPageProps) {
    const didRedirectRef = useRef(false);
    const {iouType, iouRequestType} = route.params ?? {};
    const isIouTypeValid = Object.values(CONST.IOU.TYPE).includes(iouType);
    const isIouRequestTypeValid = Object.values(CONST.IOU.REQUEST_TYPE).includes(iouRequestType);
    const isSplitDistanceSubtype = iouType === CONST.IOU.TYPE.SPLIT && iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE && isDistanceExpenseType(iouRequestType);
    const shouldShowNotFound = !isIouTypeValid || !isIouRequestTypeValid || isSplitDistanceSubtype;

    useEffect(() => {
        if (shouldShowNotFound || didRedirectRef.current) {
            return;
        }
        didRedirectRef.current = true;

        // Dismiss this modal because the redirects below will open a new modal and there shouldn't be two modals stacked on top of each other.
        Navigation.dismissModal();

        // Redirect the person to the right start page using a random reportID
        const optimisticReportID = generateReportID();
        if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE && iouType !== CONST.IOU.TYPE.SPLIT) {
            startDistanceRequest(iouType, optimisticReportID, undefined);
        } else if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
        } else if (iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE && isDistanceExpenseType(iouRequestType)) {
            startDistanceRequest(iouType, optimisticReportID, undefined, iouRequestType);
        } else {
            startMoneyRequest(iouType, optimisticReportID, undefined, iouRequestType);
        }

        // This useEffect should only run on mount which is why there are no dependencies being passed in the second parameter
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldShowNotFound) {
        return (
            <ScreenWrapper testID="IOURequestRedirectToStartPage">
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return null;
}

export default IOURequestRedirectToStartPage;
