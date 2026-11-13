import {render} from '@testing-library/react-native';

import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {FLAT_NAV_SECTION_DEFINITIONS} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSection} from '@libs/Navigation/FlatNav/types';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import React from 'react';

const WORKSPACES_DOT_COLOR = '#ff0000';

const mockNavigateToSection = jest.fn();
const mockNavigateToInsights = jest.fn();
const mockNavigateToWorkspaces = jest.fn();

jest.mock('@components/PopoverMenu', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => () => ({translate: (path: string) => path}));
jest.mock('@libs/Navigation/FlatNav/useFlatNavSections', () => jest.fn());
jest.mock('@libs/Navigation/FlatNav/useActiveFlatNavItem', () =>
    jest.fn((sections: unknown, isSearchFocused: boolean) => (isSearchFocused ? {sectionID: 'accounting', itemKey: undefined} : undefined)),
);
jest.mock('@libs/Navigation/FlatNav/useFlatNavNavigation', () => () => ({navigateToSection: mockNavigateToSection}));
jest.mock('@components/Navigation/NavigationTabBar/useInsightsTabNavigation', () => () => mockNavigateToInsights);
jest.mock('@hooks/useRestoreWorkspacesTabOnNavigate', () => () => mockNavigateToWorkspaces);
jest.mock('@hooks/useWorkspacesTabIndicatorStatus', () => () => ({indicatorColor: '#ff0000', status: 'hasPolicyErrors'}));
jest.mock('@libs/telemetry/startTabNavigationSpans', () => ({startNavigateToReportsTabSpans: jest.fn()}));

const SECTIONS: FlatNavSection[] = FLAT_NAV_SECTION_DEFINITIONS.filter((definition) => definition.id !== FLAT_NAV.SECTION.TRAVEL).map(({id, translationPath, iconName}) => ({
    id,
    translationPath,
    iconName,
    items: [],
    badgeText: id === FLAT_NAV.SECTION.ACCOUNTING ? '3' : undefined,
}));

function renderMenu(isVisible: boolean, focusedTabRouteName: string) {
    render(
        <MoreMenuPopover
            isVisible={isVisible}
            onClose={jest.fn()}
            onModalHide={jest.fn()}
            focusedTabRouteName={focusedTabRouteName}
        />,
    );
}

function getMenuItems(): PopoverMenuItem[] {
    return jest.mocked(PopoverMenu).mock.calls.at(-1)?.[0].menuItems ?? [];
}

function getMenuItem(key: string) {
    const item = getMenuItems().find((menuItem) => menuItem.key === key);
    if (!item) {
        throw new Error(`No ${key} row`);
    }
    return item;
}

describe('MoreMenuPopover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useFlatNavSections).mockReturnValue(SECTIONS);
    });

    it('lists Accounting, Saved, Insights and Workspaces with the active one highlighted', () => {
        // Given Search focused on an Accounting search
        renderMenu(true, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

        // When the menu is shown
        // Then it lists the More entries in order, each with the label of its row
        expect(getMenuItems().map((item) => item.key)).toEqual([MORE_MENU.ITEM.ACCOUNTING, MORE_MENU.ITEM.SAVED, MORE_MENU.ITEM.INSIGHTS, MORE_MENU.ITEM.WORKSPACES]);
        expect(getMenuItems().map((item) => item.sentryLabel)).toEqual([
            CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.ACCOUNTING,
            CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.SAVED,
            CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.INSIGHTS,
            CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.WORKSPACES,
        ]);
        // And every row navigates only once the sheet has closed, so no screen moves under the closing sheet
        expect(getMenuItems().every((item) => item.shouldCallAfterModalHide)).toBe(true);
        // And only Accounting is highlighted, since that is where the user is, and it carries its todo badge
        expect(
            getMenuItems()
                .filter((item) => item.isSelected)
                .map((item) => item.key),
        ).toEqual([MORE_MENU.ITEM.ACCOUNTING]);
        expect(getMenuItem(MORE_MENU.ITEM.ACCOUNTING).badgeText).toBe('3');
        // And Workspaces shows the dot the More item shows in the bar
        expect(getMenuItem(MORE_MENU.ITEM.WORKSPACES).shouldShowRightComponent).toBe(true);
        expect(getMenuItem(MORE_MENU.ITEM.WORKSPACES).rightComponent).toEqual(expect.objectContaining({props: expect.objectContaining({fill: WORKSPACES_DOT_COLOR})}));
        expect(getMenuItem(MORE_MENU.ITEM.INSIGHTS).shouldShowRightComponent).toBe(false);
    });

    it('reads the sections only while it is open', () => {
        // Given the menu mounted and closed
        renderMenu(false, SCREENS.HOME);

        // When its sections are read
        // Then they are paused, so a closed menu classifies no todos and builds no saved search titles
        expect(useFlatNavSections).toHaveBeenLastCalledWith({isActive: false});
    });

    it('opens each entry the way its tab opens it', () => {
        // Given the menu open over Home
        renderMenu(true, SCREENS.HOME);

        // When each row is pressed
        getMenuItem(MORE_MENU.ITEM.SAVED).onSelected?.();
        getMenuItem(MORE_MENU.ITEM.INSIGHTS).onSelected?.();
        getMenuItem(MORE_MENU.ITEM.WORKSPACES).onSelected?.();

        // Then Saved opens its section in Search with the Spend spans, Insights its last dashboard and Workspaces what
        // the Workspaces tab restores
        expect(mockNavigateToSection).toHaveBeenCalledWith(expect.objectContaining({id: FLAT_NAV.SECTION.SAVED}));
        expect(startNavigateToReportsTabSpans).toHaveBeenCalledTimes(1);
        expect(mockNavigateToInsights).toHaveBeenCalledTimes(1);
        expect(mockNavigateToWorkspaces).toHaveBeenCalledTimes(1);
    });
});
