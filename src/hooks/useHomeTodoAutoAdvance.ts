import DateUtils from '@libs/DateUtils';
import Growl from '@libs/Growl';
import {playHomeTodoReportExit, playHomeTodoReportTransition} from '@libs/HomeTodoReportTransition';
import {getHomeTodoReportRoute, getLatestHomeTodoReportAction, getNextHomeTodoReportID, isHomeTodoActionComplete} from '@libs/HomeTodoReviewUtils';
import openReportInPlace from '@libs/Navigation/helpers/openReportInPlace';
import Navigation from '@libs/Navigation/Navigation';
import {getServerAnchoredDBTime} from '@libs/NetworkState';
import {filterReportIDsNeedingTodoAction} from '@libs/TodosUtils';

import {clearHomeTodoReview} from '@userActions/HomeTodoReview';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {HomeTodoSearchKey} from '@src/types/onyx';

import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef, useState} from 'react';

import useLocalize from './useLocalize';
import useResponsiveLayout from './useResponsiveLayout';
import useTodoClassificationParams from './useTodoClassificationParams';

/**
 * Moves a Home to-do review on once the user takes the row's action on the open report: it confirms the action with
 * a toast, then opens the next report that still needs it, or returns to Home when none is left.
 *
 * It watches the report instead of wrapping each action button, because the action can be taken from the header, the
 * More menu, a payment or bank account step, or a child screen. The report changes optimistically, so the user moves
 * on without waiting for the server.
 *
 * It also moves on when the open report is removed while another screen covers it, for example when its last expense
 * is deleted from the Inbox, so the user doesn't come back to a missing report.
 */

type UseHomeTodoAutoAdvanceParams = {
    /** The report open on screen */
    reportID: string;

    /** The to-do row the review came from */
    searchKey: HomeTodoSearchKey;

    /** The row's reports, fixed when the user pressed `Begin` */
    reportIDs: string[];
};

/** The report the user is reviewing, and when this screen first saw it still needing the row action */
type PendingReport = {
    reportID: string;
    firstSeenPendingAt: string;
};

const TOAST_TRANSLATION_KEYS = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 'homePage.forYouSection.reportSubmitted',
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 'homePage.forYouSection.reportApproved',
    [CONST.SEARCH.SEARCH_KEYS.PAY]: 'homePage.forYouSection.reportPaid',
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 'homePage.forYouSection.reportExported',
} as const;

const CELEBRATION_TRANSLATION_KEYS = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 'homePage.forYouSection.allReportsSubmitted',
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 'homePage.forYouSection.allReportsApproved',
    [CONST.SEARCH.SEARCH_KEYS.PAY]: 'homePage.forYouSection.allReportsPaid',
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 'homePage.forYouSection.allReportsExported',
} as const;

function useHomeTodoAutoAdvance({reportID, searchKey, reportIDs}: UseHomeTodoAutoAdvanceParams) {
    const {translate} = useLocalize();
    // The report sits in the RHP, where shouldUseNarrowLayout is always true. The toast position and the report route
    // depend on the whole window, the same check Home used to open the report.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    // The to-do classification needs whole collections to find the next report that still needs the action. This
    // hook is mounted only while a report from a to-do row is open, which bounds the cost.
    const todoClassificationParams = useTodoClassificationParams();
    const {currentUserAccountID} = todoClassificationParams;
    const report = todoClassificationParams.allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportActions = todoClassificationParams.allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

    const isActionComplete = isHomeTodoActionComplete(searchKey, report, reportActions, currentUserAccountID);
    const latestTodoReportAction = getLatestHomeTodoReportAction(searchKey, reportActions);

    // Only a change seen on this screen counts. A report paged onto after another approver already acted on it opens
    // in its current state instead of being skipped straight away. The user's row action must be newer than the moment
    // the report was first seen needing it, so an older row action that loads later is not mistaken for a new one. The
    // check doesn't depend on whether the new action and the report's new state arrive in the same render. Some row
    // actions are stamped by the client clock and others by the server's, so the earlier of the two is the baseline,
    // which keeps a clock that runs ahead from hiding the user's action.
    const [pendingReport, setPendingReport] = useState<PendingReport | undefined>();
    if (!isActionComplete && !!report?.reportID && pendingReport?.reportID !== reportID) {
        const clientDBTime = DateUtils.getDBTime();
        const serverDBTime = getServerAnchoredDBTime();
        setPendingReport({reportID, firstSeenPendingAt: clientDBTime < serverDBTime ? clientDBTime : serverDBTime});
    }

    // The report's state alone also changes when an admin changes the approver or another approver acts on it, so
    // the user must also have added a new row action while it was open.
    const hasCurrentUserTakenAction =
        !!latestTodoReportAction && !!pendingReport && latestTodoReportAction.actorAccountID === currentUserAccountID && latestTodoReportAction.created > pendingReport.firstSeenPendingAt;
    const shouldAdvance = isActionComplete && pendingReport?.reportID === reportID && hasCurrentUserTakenAction;

    const getNextReportID = () => getNextHomeTodoReportID(reportIDs, reportID, filterReportIDsNeedingTodoAction(searchKey, reportIDs, todoClassificationParams));

    // Reads the latest data at the moment the action lands, without re-running the effect below whenever it changes.
    const advanceToNextReport = useEffectEvent(() => {
        const growlPosition = isSmallScreenWidth ? undefined : CONST.GROWL.POSITION.BOTTOM_RIGHT;
        const nextReportID = getNextReportID();

        if (!nextReportID) {
            // The last report shows its result like the others, then leaves the same way before the RHP closes.
            playHomeTodoReportExit(
                route.key,
                () => {
                    Growl.celebrate({
                        title: translate('homePage.forYouSection.allDone'),
                        bodyText: translate(CELEBRATION_TRANSLATION_KEYS[searchKey]),
                        position: growlPosition,
                    });
                    clearHomeTodoReview();
                    Navigation.goBack(ROUTES.HOME);
                },
                {isFocused, holdDuration: CONST.HOME_TODO_REVIEW_ANIMATION.RESULT_HOLD_DURATION},
            );
            return;
        }

        Growl.success({
            bodyText: translate(TOAST_TRANSLATION_KEYS[searchKey]),
            position: growlPosition,
        });

        // The report's navigator is targeted directly because a SET_PARAMS action without a target never reaches it
        // when a screen opened over the report sits in another navigator, as the RHP does on narrow layouts.
        const navigatorKey = navigation.getState()?.key;
        playHomeTodoReportTransition(route.key, () => openReportInPlace(nextReportID, route.key, navigatorKey), {
            isFocused,
            holdDuration: CONST.HOME_TODO_REVIEW_ANIMATION.RESULT_HOLD_DURATION,
        });

        // The action was taken on a screen opened over the report, so bring the report, now showing the next one, back on top.
        if (!isFocused) {
            Navigation.goBack(getHomeTodoReportRoute(nextReportID, isSmallScreenWidth));
        }
    });

    useEffect(() => {
        if (!shouldAdvance) {
            return;
        }
        advanceToNextReport();
    }, [shouldAdvance]);

    // A report removed while it is on screen is closed by the report screen itself, so only a removal made from
    // another screen is handled here.
    const isReportRemoved = pendingReport?.reportID === reportID && (!report || report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const shouldCloseOnFocusRef = useRef(false);

    const skipRemovedReport = useEffectEvent(() => {
        if (isFocused) {
            if (!shouldCloseOnFocusRef.current) {
                return;
            }
            shouldCloseOnFocusRef.current = false;
            clearHomeTodoReview();
            Navigation.goBack(ROUTES.HOME);
            return;
        }

        const nextReportID = getNextReportID();
        if (!nextReportID) {
            // A screen in the background can't be closed without moving the user, so it closes once they return to it.
            shouldCloseOnFocusRef.current = true;
            return;
        }
        openReportInPlace(nextReportID, route.key, navigation.getState()?.key);
    });

    useEffect(() => {
        if (!isReportRemoved) {
            return;
        }
        skipRemovedReport();
    }, [isReportRemoved, isFocused]);
}

export default useHomeTodoAutoAdvance;
