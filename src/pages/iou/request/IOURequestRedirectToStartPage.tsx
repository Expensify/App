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
    // create flow they redirect to renders "Not found" for those deprecated aliases, so resolve them here — this is
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

        // Wait for the NavigationContainer before touching navigation. On a cold load (this route pasted into the
        // address bar) this effect runs while the container is still initializing, and the dismiss and the redirect
        // are then deferred through two different mechanisms: navigate() parks the route in `pendingNavigationCall`
        // while dismissModal() queues itself on the navigation-ready promise. setIsNavigationReady() drains the
        // pending route first and resolves the promise second, so the new modal is pushed and then immediately
        // dismissed, dropping the user on the fullscreen page behind it instead of the start page. Running both
        // inside one isNavigationReady() callback keeps them in the intended order: dismiss, then redirect.
        let isCancelled = false;

        Navigation.isNavigationReady().then(() => {
            // The page can be gone by the time the container is ready. dismissModal() tears down whatever modal is on
            // top, so replaying this after the user left would dismiss a modal we never opened and push the start page
            // over it.
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
            isCancelled = true;

            // Release the once-only guard so a remount can schedule the redirect this cleanup just cancelled. A real
            // unmount throws the ref away with the instance, so this only matters when the same instance is cleaned up
            // and immediately remounted (StrictMode does that to effects in dev).
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
