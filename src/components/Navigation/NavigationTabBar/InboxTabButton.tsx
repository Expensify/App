import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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

import type {ValueOf} from 'type-fest';

import React from 'react';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

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

function startNavigateToInboxTabSpan({isWideLayout}: {isWideLayout: boolean}) {
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

type WideInboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    statusIndicatorColor: string | undefined;
    accessibilityLabel: string;
};

// The last-viewed report deep link only exists in the wide layout. In the narrow layout tapping
// Inbox always routes to ROUTES.INBOX.
function WideInboxTabButton({selectedTab, statusIndicatorColor, accessibilityLabel}: WideInboxTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startNavigateToInboxTabSpan({isWideLayout: true});

        // Fetch route params on-demand to avoid storing the full route object in render-time state
        const rootState = navigationRef.getRootState();
        const lastRoute = rootState ? getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT) : undefined;
        if (lastRoute) {
            const reportID = getStringParam(lastRoute.params, 'reportID');
            const doesLastReportExist = !!OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const)?.reportID;
            if (doesLastReportExist) {
                const reportActionID = getStringParam(lastRoute.params, 'reportActionID');
                const referrer = getStringParam(lastRoute.params, 'referrer');
                const backTo = getStringParam(lastRoute.params, 'backTo');
                const reportActions = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const);
                const reportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
                const doesLastReportActionExist = !!reportAction && !isDeletedAction(reportAction);
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

        startNavigateToInboxTabSpan({isWideLayout: false});
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
