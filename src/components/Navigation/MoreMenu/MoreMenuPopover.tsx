/**
 * The menu the More item of the flat nav native bar opens: Accounting, Saved, Insights and Workspaces, with the one the
 * user is on highlighted. It floats as a card just above the bar, so the bar stays in view under it.
 */
import IconWithStatusIndicator from '@components/Navigation/IconWithStatusIndicator';
import getTabAccessibilityLabel from '@components/Navigation/NavigationTabBar/getTabAccessibilityLabel';
import getTabIconFill from '@components/Navigation/NavigationTabBar/getTabIconFill';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import StatusIndicator from '@components/Navigation/StatusIndicator';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical';
import {getTabBarTop} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions';
import useActiveFlatNavItem from '@libs/Navigation/FlatNav/useActiveFlatNavItem';
import useFlatNavNavigation from '@libs/Navigation/FlatNav/useFlatNavNavigation';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';
import openSearchFromTabBar from '@libs/Navigation/FlatNavTabBar/openSearchFromTabBar';
import getMoreMenuItems from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import type {MoreMenuItem} from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {AnchorPosition} from '@src/styles';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useRef} from 'react';

type MoreMenuPopoverProps = {
    isVisible: boolean;
    onClose: () => void;

    /** Called once the menu has finished closing */
    onModalHide: () => void;

    /** The focused route of the tab navigator, which decides the highlighted entry */
    focusedTabRouteName: string | undefined;
};

// A bottom docked menu ignores its anchor.
const ANCHOR_POSITION: AnchorPosition = {horizontal: 0, vertical: 0};

const SENTRY_LABELS: Record<MoreMenuItem['id'], SentryLabel> = {
    [MORE_MENU.ITEM.ACCOUNTING]: CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.ACCOUNTING,
    [MORE_MENU.ITEM.SAVED]: CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.SAVED,
    [MORE_MENU.ITEM.INSIGHTS]: CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.INSIGHTS,
    [MORE_MENU.ITEM.WORKSPACES]: CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.WORKSPACES,
};

function MoreMenuPopover({isVisible, onClose, onModalHide, focusedTabRouteName}: MoreMenuPopoverProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {bottom: bottomInset, left: leftInset, right: rightInset} = useSafeAreaInsets();
    // A bar laid out as a column sits beside the content, so the card only clears the home indicator then.
    const cardBottomOffset = useIsTabBarVertical() ? bottomInset : getTabBarTop(bottomInset);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const isSearchFocused = focusedTabRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
    // The sections stay frozen while the menu animates closed.
    const sections = useFlatNavSections({isActive: isVisible});
    const activeFlatNavSectionID = useActiveFlatNavItem(sections, isSearchFocused)?.sectionID;
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {navigateToSection} = useFlatNavNavigation();
    const navigateToInsights = useInsightsTabNavigation(focusedTabRouteName === SCREENS.INSIGHTS);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const items = getMoreMenuItems({
        sections,
        focusedTabRouteName,
        activeFlatNavSectionID,
        workspacesDotColor: workspacesIndicatorStatus ? workspacesIndicatorColor : undefined,
    });
    const icons = useMemoizedLazyExpensifyIcons(items.map((item) => item.iconName));

    const openItem = (item: MoreMenuItem) => {
        switch (item.id) {
            case MORE_MENU.ITEM.INSIGHTS:
                navigateToInsights();
                return;
            case MORE_MENU.ITEM.WORKSPACES:
                navigateToWorkspaces();
                return;
            default:
                openSearchFromTabBar(() => navigateToSection(item.section), isSearchFocused, session);
        }
    };

    const menuItems: PopoverMenuItem[] = items.map((item) => {
        const indicatorColor = 'indicatorColor' in item ? item.indicatorColor : undefined;
        const text = translate(item.translationPath);
        return {
            key: item.id,
            text,
            accessibilityLabel: getTabAccessibilityLabel(text, !!indicatorColor, translate),
            // The icon is drawn by the row itself, with the dot the bar draws on its tab and the bar's selected color.
            leftComponent: (
                <IconWithStatusIndicator
                    src={icons[item.iconName]}
                    fill={getTabIconFill(item.isActive, false, theme)}
                    size={variables.iconSizeNormal}
                >
                    {!!indicatorColor && (
                        <StatusIndicator
                            color={indicatorColor}
                            borderColor={item.isActive ? theme.activeComponentBG : theme.componentBG}
                            testID={`MoreMenuItemStatusIndicator-${item.id}`}
                        />
                    )}
                </IconWithStatusIndicator>
            ),
            innerContainerStyle: styles.alignItemsCenter,
            isSelected: item.isActive,
            shouldShowBasicTitle: !item.isActive,
            // PopoverMenu passes the item's props after its own title style, so this replaces its flex1 and has to repeat it.
            titleStyle: [styles.flex1, !item.isActive && styles.textSupporting],
            wrapperStyle: [styles.br3, item.isActive && styles.activeComponentBG],
            badgeText: 'badgeText' in item ? item.badgeText : undefined,
            // The badge is a todo count, which is green everywhere else it is shown.
            isBadgeSuccess: true,
            sentryLabel: SENTRY_LABELS[item.id],
            // Navigating under the closing sheet would move the screens behind it, and can leave the modal marked as visible.
            shouldCallAfterModalHide: true,
            onSelected: () => openItem(item),
        };
    });

    return (
        <PopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onClose}
            onModalHide={onModalHide}
            menuItems={menuItems}
            anchorRef={anchorRef}
            anchorPosition={ANCHOR_POSITION}
            shouldUseModalPaddingStyle={false}
            // The card's margins clear the notch in landscape, so the modal's own side padding would only narrow its rows.
            shouldAddSideSafeAreaPadding={false}
            // The screen and the bar stay in view under the card, and a tap outside it still closes it.
            backdropOpacity={0}
            innerContainerStyle={styles.moreMenuCard(cardBottomOffset, leftInset, rightInset)}
            scrollContainerStyle={[styles.pv2, styles.ph2]}
        />
    );
}

export default MoreMenuPopover;
