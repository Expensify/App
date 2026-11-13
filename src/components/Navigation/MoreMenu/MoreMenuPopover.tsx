/**
 * The menu the More item of the flat nav native bar opens: Accounting, Saved, Insights and Workspaces, with the one the
 * user is on highlighted. It is docked to the bottom of the screen, so it needs no anchor.
 */
import Icon from '@components/Icon';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import useActiveFlatNavItem from '@libs/Navigation/FlatNav/useActiveFlatNavItem';
import useFlatNavNavigation from '@libs/Navigation/FlatNav/useFlatNavNavigation';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';
import openSearchFromTabBar from '@libs/Navigation/FlatNavTabBar/openSearchFromTabBar';
import getMoreMenuItems from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import type {MoreMenuItem} from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {AnchorPosition} from '@src/styles';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

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
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const anchorRef = useRef<View>(null);
    const isSearchFocused = focusedTabRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
    // The sections do no work while the menu is closed.
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
    const icons = useMemoizedLazyExpensifyIcons([...items.map((item) => item.iconName), 'DotIndicator']);

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

    const menuItems: PopoverMenuItem[] = items.map((item) => ({
        key: item.id,
        text: translate(item.translationPath),
        icon: icons[item.iconName],
        isSelected: item.isActive,
        badgeText: 'badgeText' in item ? item.badgeText : undefined,
        rightComponent:
            'indicatorColor' in item && item.indicatorColor ? (
                <Icon
                    src={icons.DotIndicator}
                    fill={item.indicatorColor}
                />
            ) : undefined,
        shouldShowRightComponent: 'indicatorColor' in item && !!item.indicatorColor,
        sentryLabel: SENTRY_LABELS[item.id],
        // Navigating under the closing sheet would move the screens behind it, and can leave the modal marked as visible.
        shouldCallAfterModalHide: true,
        onSelected: () => openItem(item),
    }));

    return (
        <PopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onClose}
            onModalHide={onModalHide}
            menuItems={menuItems}
            anchorRef={anchorRef}
            anchorPosition={ANCHOR_POSITION}
        />
    );
}

export default MoreMenuPopover;
export type {MoreMenuPopoverProps};
