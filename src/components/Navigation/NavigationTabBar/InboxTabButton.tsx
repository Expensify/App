import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isDeletedAction} from '@libs/ReportActionsUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';
import getLastRoute from './getLastRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

type InboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
    statusIndicatorColor: string | undefined;
    chatTabBrickRoad: BrickRoad;
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

function InboxTabButton({selectedTab, isWideLayout, statusIndicatorColor, chatTabBrickRoad}: InboxTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

    const lastReportRouteReportID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return (route?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT])?.reportID;
    });

    const lastReportRouteReportActionID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return (route?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT])?.reportActionID;
    });

    const [doesLastReportExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastReportRouteReportID}`, {selector: doesLastReportExistSelector}, [lastReportRouteReportID]);

    const doesLastReportActionExistSelector = makeDoesLastReportActionExistSelector(lastReportRouteReportActionID);
    const [doesLastReportActionExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lastReportRouteReportID}`, {selector: doesLastReportActionExistSelector}, [
        lastReportRouteReportID,
        lastReportRouteReportActionID,
    ]);

    const inboxAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.INBOX};

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
            name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
            op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        });

        if (isWideLayout && doesLastReportExist) {
            // Fetch route params on-demand to avoid storing the full route object in render-time state
            const rootState = navigationRef.getRootState();
            const lastRoute = rootState ? getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT) : undefined;
            if (lastRoute) {
                const {reportID, reportActionID, referrer, backTo} = lastRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, doesLastReportActionExist ? reportActionID : undefined, referrer, backTo));
                return;
            }
        }

        Navigation.navigate(ROUTES.INBOX);
    };

    const accessibilityLabel = chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox');

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToChats}
                role={CONST.ROLE.TAB}
                accessibilityLabel={accessibilityLabel}
                accessibilityState={inboxAccessibilityState}
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

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={inboxAccessibilityState}
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
