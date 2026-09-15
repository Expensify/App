import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';

import Navigation, {startOpenReportSpan} from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isDeletedAction} from '@libs/ReportActionsUtils';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {TabActions} from '@react-navigation/native';
import {useEffect, useMemo, useRef} from 'react';

import getLastRoute from './getLastRoute';
import getReusableReportsTabStateKey, {getTabNavigatorStateKey} from './getReusableReportsTabStateKey';
import getStringParam from './getStringParam';

function doesLastReportExistSelector(report: OnyxEntry<Report>) {
    return !!report?.reportID;
}

function makeDoesLastReportActionExistSelector(actionID: string | undefined) {
    return (reportActions: OnyxEntry<ReportActions>) => {
        const reportAction = actionID ? reportActions?.[actionID] : undefined;
        return !!reportAction && !isDeletedAction(reportAction);
    };
}

/**
 * Returns the wide-layout Inbox navigation handler, which reopens the last-viewed report instead of the
 * Inbox root. It subscribes to that report, so only call it from components that render in the wide layout.
 *
 * @param isInboxSelected whether the Inbox tab is the one currently showing
 */
function useWideInboxNavigation(isInboxSelected: boolean) {
    const hasVisitedInboxTab = useRef(isInboxSelected);

    useEffect(() => {
        if (!isInboxSelected) {
            return;
        }
        hasVisitedInboxTab.current = true;
    }, [isInboxSelected]);

    const lastReportRouteReportID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return getStringParam(route?.params, 'reportID');
    });

    const lastReportRouteReportActionID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return getStringParam(route?.params, 'reportActionID');
    });

    const [doesLastReportExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastReportRouteReportID}`, {selector: doesLastReportExistSelector});

    const doesLastReportActionExistSelector = useMemo(() => makeDoesLastReportActionExistSelector(lastReportRouteReportActionID), [lastReportRouteReportActionID]);

    const [doesLastReportActionExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lastReportRouteReportID}`, {
        selector: doesLastReportActionExistSelector,
    });

    return () => {
        if (isInboxSelected) {
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
            name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
            op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
            forceTransaction: true,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_WIDE_LAYOUT]: true},
        });

        if (doesLastReportExist) {
            // Fetch route params on-demand to avoid storing the full route object in render-time state
            const rootState = navigationRef.getRootState();
            const lastRoute = rootState ? getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT) : undefined;
            if (lastRoute) {
                const reportID = getStringParam(lastRoute.params, 'reportID');
                const reportActionID = getStringParam(lastRoute.params, 'reportActionID');
                const referrer = getStringParam(lastRoute.params, 'referrer');
                const backTo = getStringParam(lastRoute.params, 'backTo');
                const tabNavigatorStateKey = getTabNavigatorStateKey(rootState);
                const reusableReportsTabStateKey = getReusableReportsTabStateKey(rootState, reportID, reportActionID, doesLastReportActionExist);
                const shouldDeferReportActions = !hasVisitedInboxTab.current;
                const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(reportID, doesLastReportActionExist ? reportActionID : undefined, referrer, backTo);

                if (reusableReportsTabStateKey && !shouldDeferReportActions) {
                    // Focusing the existing tab without nested params preserves the mounted ReportScreen and
                    // avoids rebuilding its cached report list as part of the tab navigation commit.
                    navigationRef.dispatch({
                        ...TabActions.jumpTo(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR),
                        target: reusableReportsTabStateKey,
                    });
                    return;
                }
                if (tabNavigatorStateKey && reportID) {
                    startOpenReportSpan(reportRoute);
                    navigationRef.dispatch({
                        ...TabActions.jumpTo(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {
                            screen: SCREENS.REPORT,
                            ...(shouldDeferReportActions ? {shouldDeferInitialReportActions: true} : {}),
                            params: {
                                reportID,
                                reportActionID: doesLastReportActionExist ? reportActionID : undefined,
                                referrer,
                                backTo,
                            },
                        }),
                        target: tabNavigatorStateKey,
                    });
                    return;
                }
                Navigation.navigate(reportRoute);
                return;
            }
        }

        if (lastReportRouteReportID) {
            Navigation.navigate(ROUTES.INBOX);
            return;
        }

        const tabNavigatorStateKey = getTabNavigatorStateKey(navigationRef.getRootState());
        if (tabNavigatorStateKey) {
            navigationRef.dispatch({
                ...TabActions.jumpTo(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {
                    shouldDeferInitialReportActions: true,
                }),
                target: tabNavigatorStateKey,
            });
            return;
        }

        Navigation.navigate(ROUTES.INBOX);
    };
}

export default useWideInboxNavigation;
