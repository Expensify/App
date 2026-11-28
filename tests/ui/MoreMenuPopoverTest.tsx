import {render, screen} from '@testing-library/react-native';

import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {FLAT_NAV_SECTION_DEFINITIONS} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSavedSearchItem, FlatNavSection} from '@libs/Navigation/FlatNav/types';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import React from 'react';

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

/** The More menu lists a section only when it has a search to open, and any item that can be opened will do here. */
const SAVED_SEARCH_ITEM: FlatNavSavedSearchItem = {
    type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
    key: savedSearchIDToSearchKey('1'),
    sectionID: FLAT_NAV.SECTION.SAVED,
    savedSearchID: '1',
    name: 'Saved 1',
    title: 'Saved 1',
    query: 'type:expense',
    iconName: 'Bookmark',
    isDisabled: false,
};

const SECTIONS: FlatNavSection[] = FLAT_NAV_SECTION_DEFINITIONS.filter((definition) => definition.id !== FLAT_NAV.SECTION.TRAVEL).map(({id, translationPath, iconName}) => ({
    id,
    translationPath,
    iconName,
    items: [SAVED_SEARCH_ITEM],
    badgeText: id === FLAT_NAV.SECTION.ACCOUNTING ? '3' : undefined,
}));

function renderMenu(isVisible: boolean, focusedTabRouteName: string) {
    render(
        <MoreMenuPopover
            isVisible={isVisible}
            onClose={jest.fn()}
            onItemPicked={jest.fn()}
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

    it('highlights the entry the user is on and navigates once the sheet has closed', () => {
        // Given Search focused on an Accounting search
        renderMenu(true, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

        // When the menu is shown
        // Then every row navigates only once the sheet has closed, so no screen moves under the closing sheet
        expect(getMenuItems().every((item) => item.shouldCallAfterModalHide)).toBe(true);
        // And only Accounting is highlighted, since that is where the user is, and it carries its todo badge in green
        expect(
            getMenuItems()
                .filter((item) => item.isSelected)
                .map((item) => item.key),
        ).toEqual([MORE_MENU.ITEM.ACCOUNTING]);
        expect(getMenuItem(MORE_MENU.ITEM.ACCOUNTING).badgeText).toBe('3');
        expect(getMenuItem(MORE_MENU.ITEM.ACCOUNTING).isBadgeSuccess).toBe(true);
        // And only Accounting has a bold title, so the highlighted row reads as the selected one as in the bar
        expect(
            getMenuItems()
                .filter((item) => !item.shouldShowBasicTitle)
                .map((item) => item.key),
        ).toEqual([MORE_MENU.ITEM.ACCOUNTING]);
    });

    it('shows the Workspaces dot on the Workspaces icon and announces it', () => {
        // Given workspaces that need the user's attention
        renderMenu(true, SCREENS.HOME);

        // When the icons of the rows are drawn
        render(
            <>
                {getMenuItems().map((item) => (
                    <React.Fragment key={item.key}>{item.leftComponent}</React.Fragment>
                ))}
            </>,
        );

        // Then the dot sits on the Workspaces icon only, as on the Workspaces tab of the wide bar
        expect(screen.getAllByTestId(/^MoreMenuItemStatusIndicator-/)).toHaveLength(1);
        expect(screen.getByTestId(`MoreMenuItemStatusIndicator-${MORE_MENU.ITEM.WORKSPACES}`)).toBeOnTheScreen();
        // And a screen reader hears why the dot is there, since it carries no text of its own
        expect(getMenuItem(MORE_MENU.ITEM.WORKSPACES).accessibilityLabel).toBe('common.workspacesTabTitle. common.yourReviewIsRequired');
        expect(getMenuItem(MORE_MENU.ITEM.INSIGHTS).accessibilityLabel).toBe(getMenuItem(MORE_MENU.ITEM.INSIGHTS).text);
    });

    it.each([true, false])('reads the sections only while it is open: open %s', (isVisible) => {
        // Given the menu mounted, open or closing
        renderMenu(isVisible, SCREENS.HOME);

        // When its sections are read
        // Then they are paused while it is closed, so a closing menu classifies no todos and builds no saved search titles
        expect(useFlatNavSections).toHaveBeenLastCalledWith({isActive: isVisible});
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
