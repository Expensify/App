import {fireEvent, render, screen} from '@testing-library/react-native';

import Icon from '@components/Icon';
import FlatNavMoreTabButton from '@components/Navigation/NavigationTabBar/FlatNavMoreTabButton';
import TabBarItemIcon from '@components/Navigation/NavigationTabBar/TabBarItemIcon';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/MORE_MENU';
import MoreMenuStateContext from '@libs/Navigation/MoreMenu/MoreMenuStateContext';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/Navigation/NavigationTabBar/TabBarItemIcon', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({CaretUpDown: 'caret-up-down', Connect: 'connect', Bookmark: 'bookmark', PieChart: 'pie-chart', Buildings: 'buildings'}),
}));
jest.mock('@hooks/useWorkspacesTabIndicatorStatus', () => () => ({indicatorColor: 'danger', status: undefined}));
jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));

function renderButton(isSelected: boolean, moreTabItemID: MoreMenuItemID | undefined, setMoreMenuState = jest.fn()) {
    render(
        <MoreMenuStateContext.Provider value={['closed', setMoreMenuState]}>
            <FlatNavMoreTabButton
                isSelected={isSelected}
                moreTabItemID={moreTabItemID}
            />
        </MoreMenuStateContext.Provider>,
    );
    return setMoreMenuState;
}

describe('FlatNavMoreTabButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the entry the user is on with the More chevron beside it', () => {
        // Given the user on Workspaces, which More stands for
        renderButton(true, MORE_MENU.ITEM.WORKSPACES);

        // Then the item draws the Workspaces icon, with the chevron beside it
        expect(jest.mocked(TabBarItemIcon).mock.lastCall?.[0].icon).toBe('buildings');
        expect(jest.mocked(Icon).mock.lastCall?.[0].src).toBe('caret-up-down');
    });

    it('shows the chevron alone when no entry is on screen', () => {
        // Given the user on a tab More does not stand for
        renderButton(false, undefined);

        // Then the item draws only the chevron, with no second chevron beside it
        expect(jest.mocked(TabBarItemIcon).mock.lastCall?.[0].icon).toBe('caret-up-down');
        expect(Icon).not.toHaveBeenCalled();
    });

    it('opens the More menu on a tap, through the sign-in check for anonymous users', () => {
        // Given the More tab
        const setMoreMenuState = renderButton(false, undefined);

        // When the user taps it
        fireEvent.press(screen.getByRole(CONST.ROLE.TAB));

        // Then the menu opens, as anonymous users get the sign-in instead
        expect(interceptAnonymousUser).toHaveBeenCalledTimes(1);
        expect(setMoreMenuState).toHaveBeenCalledWith('open');
    });
});
