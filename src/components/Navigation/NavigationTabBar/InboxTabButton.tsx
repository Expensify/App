import {PressableWithFeedback} from '@components/Pressable';

import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import getTabAccessibilityLabel from './getTabAccessibilityLabel';
import navigateToInboxTab from './navigateToInboxTab';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useWideInboxNavigation from './useWideInboxNavigation';

type InboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;

    /** Whether the wide-layout button uses the shorter row, for windows too short to fit the full-height rows */
    isCompact?: boolean;
};

type WideInboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    statusIndicatorColor: string | undefined;
    accessibilityLabel: string;
    isCompact: boolean;
};

// The last-viewed report deep link only exists in the wide layout, so the report and report-action
// Onyx subscriptions live in useWideInboxNavigation and are only created when the wide layout is rendered. In the
// narrow layout tapping Inbox always routes to ROUTES.INBOX, so these subscriptions are never set up.
function WideInboxTabButton({selectedTab, statusIndicatorColor, accessibilityLabel, isCompact}: WideInboxTabButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);
    const navigateToChats = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
            linkRoute={ROUTES.INBOX}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{selected: selectedTab === NAVIGATION_TABS.INBOX}}
            style={({hovered}) => [
                styles.leftNavigationTabBarItem,
                isCompact && StyleUtils.getHeight(variables.navigationTabBarCompactItemHeight),
                hovered && styles.navigationTabBarItemHovered,
            ]}
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

function InboxTabButton({selectedTab, isWideLayout, isCompact = false}: InboxTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status: chatTabBrickRoad, indicatorColor: statusIndicatorColor} = useInboxTabIndicatorStatus();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

    const accessibilityLabel = getTabAccessibilityLabel(translate('common.inbox'), !!chatTabBrickRoad, translate);

    if (isWideLayout) {
        return (
            <WideInboxTabButton
                selectedTab={selectedTab}
                statusIndicatorColor={statusIndicatorColor}
                accessibilityLabel={accessibilityLabel}
                isCompact={isCompact}
            />
        );
    }

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }
        navigateToInboxTab();
    };

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
            linkRoute={ROUTES.INBOX}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{selected: selectedTab === NAVIGATION_TABS.INBOX}}
            wrapperStyle={styles.navigationTabBarSlot}
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
