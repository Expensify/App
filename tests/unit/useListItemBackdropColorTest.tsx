import {renderHook} from '@testing-library/react-native';

import useListItemBackdropColor from '@components/SelectionList/ListItemComposed/hooks/useListItemBackdropColor';
import {ListItemContext, ListItemHoverContext} from '@components/SelectionList/ListItemContext';

import React from 'react';

const FOCUSED_COLOR = '#focused';
const HOVERED_COLOR = '#hovered';
const SIDEBAR_COLOR = '#sidebar';

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: jest.fn(() => ({sidebar: SIDEBAR_COLOR})),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        sidebarLinkActive: {backgroundColor: FOCUSED_COLOR},
        sidebarLinkHover: {backgroundColor: HOVERED_COLOR},
    })),
}));

const renderBackdropColor = ({isFocusVisible, isHovered}: {isFocusVisible: boolean; isHovered: boolean}) =>
    renderHook(() => useListItemBackdropColor(), {
        wrapper: ({children}) => (
            <ListItemContext.Provider value={{isFocused: false, isFocusVisible, shouldShowTooltip: false, isDisabled: false, isInteractive: true, shouldDisableAccessibleGrouping: false}}>
                <ListItemHoverContext.Provider value={isHovered}>{children}</ListItemHoverContext.Provider>
            </ListItemContext.Provider>
        ),
    });

describe('useListItemBackdropColor', () => {
    it.each([
        ['resting row blends into the sidebar', {isFocusVisible: false, isHovered: false}, SIDEBAR_COLOR],
        ['visually focused row takes the focused background', {isFocusVisible: true, isHovered: false}, FOCUSED_COLOR],
        ['hovered row takes the hovered background', {isFocusVisible: false, isHovered: true}, HOVERED_COLOR],
        ['focus wins over hover', {isFocusVisible: true, isHovered: true}, FOCUSED_COLOR],
    ])('%s', (_label, contextState, expectedColor) => {
        const {result} = renderBackdropColor(contextState);

        expect(result.current).toBe(expectedColor);
    });
});
