import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import useOnyx from '@hooks/useOnyx';

import {clearMoneyRequest, startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {getNonDeprecatedIOUType} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {isDistanceExpenseType} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useEffect, useRef} from 'react';

import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestRedirectToStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.START>;

function IOURequestRedirectToStartPage({route}: IOURequestRedirectToStartPageProps) {
    const didRedirectRef = useRef(false);
    const {iouType: iouTypeParam, iouRequestType} = route.params ?? {};

    // `/start/request/…` and `/start/send/…` still exist in OldDot links and in links people paste into chat. The
    // create flow they redirect to renders "Not found" for those deprecated aliases, so resolve them here. This is
    // the one place every `/start/…` link passes through before a create route is built.
    const iouType = getNonDeprecatedIOUType(iouTypeParam);
    const isIouTypeValid = Object.values(CONST.IOU.TYPE).includes(iouTypeParam);
    const isIouRequestTypeValid = Object.values(CONST.IOU.REQUEST_TYPE).includes(iouRequestType);
    const isSplitDistanceSubtype = iouType === CONST.IOU.TYPE.SPLIT && iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE && isDistanceExpenseType(iouRequestType);
    const shouldShowNotFound = !isIouTypeValid || !isIouRequestTypeValid || isSplitDistanceSubtype;
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    useEffect(() => {
        if (shouldShowNotFound || didRedirectRef.current) {
            return;
        }
        didRedirectRef.current = true;

        // Quick-action deeplinks (the "Scan receipt" / "Track distance" home-screen shortcuts) reuse
        // OPTIMISTIC_TRANSACTION_ID, so a leftover draft from an earlier shortcut can still be present. The
        // start*Request helpers below are invoked without draft IDs and the odometer branch skips them, so clear
        // the stale draft here. OPTIMISTIC_TRANSACTION_ID is passed explicitly because the selector returns [] (not
        // undefined) before the drafts load, so a fallback alone would clear nothing.
        clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, [CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ...(draftTransactionIDs ?? [])]);

        let isCancelled = false;

        Navigation.isNavigationReady().then(() => {
            if (isCancelled) {
                return;
            }

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
        });

        return () => {
            // This page is getting unmounted so we cancel any navigation effects
            isCancelled = true;

            didRedirectRef.current = false;
        };

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
