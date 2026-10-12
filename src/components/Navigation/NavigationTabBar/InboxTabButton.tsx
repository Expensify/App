import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useWideInboxNavigation, {startNavigateToInboxTabSpan} from './useWideInboxNavigation';

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
// Onyx subscriptions live in the hook and are only created when the wide layout is rendered. In the
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
