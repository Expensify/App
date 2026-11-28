import {act, render} from '@testing-library/react-native';

import {NO_REACH} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';
import scrollToTab from '@components/TabSelector/scrollToTab';
import TabSelectorContextProvider, {useTabSelectorActions} from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorActionsContextType} from '@components/TabSelector/types.context';

import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect} from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/TabSelector/scrollToTab', () => jest.fn());

const CONTAINER_WIDTH = 300;
const TAB_WIDTH = 100;
const TAB_KEYS = ['expenses', 'reports', 'approve', 'pay', 'export', 'saved'];
const LAST_TAB_KEY = 'saved';
const FIRST_TAB_KEY = 'expenses';

const actionsRef: {current: TabSelectorActionsContextType | undefined} = {current: undefined};

/** Hands the test the actions the tabs of a row call, so it can lay the row out and press a tab without rendering the row. */
function ActionsProbe() {
    const actions = useTabSelectorActions();
    useEffect(() => {
        actionsRef.current = actions;
    });
    return null;
}

function buildLayoutEvent(x: number, width: number) {
    return createMock<LayoutChangeEvent>({nativeEvent: {layout: {x, y: 0, width, height: 40}}});
}

function buildRow(activeTabKey: string) {
    return (
        <TabSelectorContextProvider activeTabKey={activeTabKey}>
            <ActionsProbe />
        </TabSelectorContextProvider>
    );
}

function renderRow(activeTabKey: string) {
    const view = render(buildRow(activeTabKey));
    act(() => {
        actionsRef.current?.onContainerLayout(buildLayoutEvent(0, CONTAINER_WIDTH), NO_REACH);
        for (const [index, tabKey] of TAB_KEYS.entries()) {
            actionsRef.current?.onTabLayout(tabKey, buildLayoutEvent(index * TAB_WIDTH, TAB_WIDTH));
        }
    });
    return (nextActiveTabKey: string) => view.rerender(buildRow(nextActiveTabKey));
}

describe('TabSelectorContextProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('scrolls to a tab made active from outside the row before any tab in it was pressed', () => {
        // Given a row wider than its container, laid out with its last tab active and no tab pressed yet, as the Search
        // type tabs are after a saved search is opened from the More menu
        const setActiveTabKey = renderRow(LAST_TAB_KEY);
        jest.mocked(scrollToTab).mockClear();

        // When the first tab becomes active from outside the row, as it does when the bottom bar opens Expenses
        setActiveTabKey(FIRST_TAB_KEY);

        // Then the row scrolls to that tab, because the active tab would otherwise stay off screen
        expect(scrollToTab).toHaveBeenCalledTimes(1);
        expect(scrollToTab).toHaveBeenCalledWith(expect.objectContaining({tabX: 0, tabWidth: TAB_WIDTH, containerWidth: CONTAINER_WIDTH}));
    });

    it('does not scroll a second time for a tab the user pressed in the row', () => {
        // Given a laid out row whose first tab is active
        const setActiveTabKey = renderRow(FIRST_TAB_KEY);
        jest.mocked(scrollToTab).mockClear();

        // When the user presses the last tab, which scrolls to it, and the tab then becomes the active one
        act(() => actionsRef.current?.scrollToTab(LAST_TAB_KEY));
        setActiveTabKey(LAST_TAB_KEY);

        // Then only the press scrolled, since a second scroll to the same tab would restart its animation
        expect(scrollToTab).toHaveBeenCalledTimes(1);
    });

    it('leaves the first scroll of a mounting row to its layout', () => {
        // Given a row whose last tab is the active one

        // When the row mounts and its tabs are laid out
        renderRow(LAST_TAB_KEY);

        // Then it scrolls there without an animation, from the layout of that tab alone, so the row does not slide in on mount
        expect(scrollToTab).toHaveBeenCalledTimes(1);
        expect(scrollToTab).toHaveBeenCalledWith(expect.objectContaining({tabX: (TAB_KEYS.length - 1) * TAB_WIDTH, animated: false}));
    });
});
