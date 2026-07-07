import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
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
import type {ValueOf} from 'type-fest';

import React from 'react';

import getLastRoute from './getLastRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

function getStringParam(params: unknown, key: string): string | undefined {
    if (!params || typeof params !== 'object') {
        return undefined;
    }
    for (const [k, v] of Object.entries(params)) {
        if (k === key && typeof v === 'string') {
            return v;
        }
    }
    return undefined;
}

function startNavigateToInboxTabSpan(isWideLayout: boolean) {
    startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
        name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_WIDE_LAYOUT]: isWideLayout},
    });
}

type InboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function doesLastReportExistSelector(report: OnyxEntry<Report>) {
    return !!report?.reportID;
}

function makeDoesLastReportActionExistSelector(actionID: string | undefined) {
    return (reportActions: OnyxEntry<ReportActions>) => {
        const reportAction = actionID ? reportActions?.[actionID] : undefined;
        return !!reportAction && !isDeletedAction(reportAction);
    };
}

type WideInboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    statusIndicatorColor: string | undefined;
    accessibilityLabel: string;
};

// The last-viewed report deep link only exists in the wide layout, so the report and report-action
// Onyx subscriptions live here and are only created when the wide layout is rendered. In the narrow
// layout tapping Inbox always routes to ROUTES.INBOX, so these subscriptions are never set up.
function WideInboxTabButton({selectedTab, statusIndicatorColor, accessibilityLabel}: WideInboxTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

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

    const [doesLastReportExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastReportRouteReportID}`, {selector: doesLastReportExistSelector}, [lastReportRouteReportID]);

    const doesLastReportActionExistSelector = makeDoesLastReportActionExistSelector(lastReportRouteReportActionID);
    const [doesLastReportActionExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lastReportRouteReportID}`, {selector: doesLastReportActionExistSelector}, [
        lastReportRouteReportID,
        lastReportRouteReportActionID,
    ]);

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startNavigateToInboxTabSpan(true);

        if (doesLastReportExist) {
            // Fetch route params on-demand to avoid storing the full route object in render-time state
            const rootState = navigationRef.getRootState();
            const lastRoute = rootState ? getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT) : undefined;
            if (lastRoute) {
                const reportID = getStringParam(lastRoute.params, 'reportID');
                const reportActionID = getStringParam(lastRoute.params, 'reportActionID');
                const referrer = getStringParam(lastRoute.params, 'referrer');
                const backTo = getStringParam(lastRoute.params, 'backTo');
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, doesLastReportActionExist ? reportActionID : undefined, referrer, backTo));
                return;
            }
        }

        Navigation.navigate(ROUTES.INBOX);
    };

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{selected: selectedTab === NAVIGATION_TABS.INBOX}}
            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
        >
            {({hovered}) => (
                <TabBarItem
                    icon={expensifyIcons.Inbox}
                    label={translate('common.inbox')}
                    isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                    isHovered={hovered}
                    statusIndicatorColor={statusIndicatorColor}
                />
            )}
        </PressableWithFeedback>
    );
}

function InboxTabButton({selectedTab, isWideLayout}: InboxTabButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

    let statusIndicatorColor: string | undefined;
    if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        statusIndicatorColor = theme.iconSuccessFill;
    } else if (chatTabBrickRoad) {
        statusIndicatorColor = theme.danger;
    }

    const accessibilityLabel = chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox');

    if (isWideLayout) {
        return (
            <WideInboxTabButton
                selectedTab={selectedTab}
                statusIndicatorColor={statusIndicatorColor}
                accessibilityLabel={accessibilityLabel}
            />
        );
    }

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startNavigateToInboxTabSpan(false);
        Navigation.navigate(ROUTES.INBOX);
    };

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{selected: selectedTab === NAVIGATION_TABS.INBOX}}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
        >
            <TabBarItem
                icon={expensifyIcons.Inbox}
                label={translate('common.inbox')}
                isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                statusIndicatorColor={statusIndicatorColor}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default InboxTabButton;
