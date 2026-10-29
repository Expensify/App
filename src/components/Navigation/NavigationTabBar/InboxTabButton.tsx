import {PressableWithFeedback} from '@components/Pressable';

import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

import navigateToInboxTab from './navigateToInboxTab';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useWideInboxNavigation from './useWideInboxNavigation';

type InboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

type WideInboxTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    statusIndicatorColor: string | undefined;
    accessibilityLabel: string;
};

// The last-viewed report deep link only exists in the wide layout, so the report and report-action
// Onyx subscriptions live in useWideInboxNavigation and are only created when the wide layout is rendered. In the
// narrow layout tapping Inbox always routes to ROUTES.INBOX, so these subscriptions are never set up.
function WideInboxTabButton({selectedTab, statusIndicatorColor, accessibilityLabel}: WideInboxTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);
    const navigateToChats = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);

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
    const {translate} = useLocalize();
    const {status: chatTabBrickRoad, indicatorColor: statusIndicatorColor} = useInboxTabIndicatorStatus();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Inbox']);

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
        navigateToInboxTab();
    };

    return (
        <PressableWithFeedback
            onPress={navigateToChats}
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
