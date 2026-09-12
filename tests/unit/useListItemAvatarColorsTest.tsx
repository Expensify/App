import {renderHook} from '@testing-library/react-native';

import {useListItemSecondaryAvatarContainerStyle, useListItemSubscriptAvatarBorderColor} from '@components/SelectionList/ListItemComposed/hooks/useListItemAvatarColors';
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

jest.mock('@hooks/useStyleUtils', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        getBackgroundAndBorderStyle: (color: string) => ({backgroundColor: color, borderColor: color}),
    })),
}));

const backgroundAndBorder = (color: string) => ({backgroundColor: color, borderColor: color});

const renderColors = ({isFocusVisible, isHovered}: {isFocusVisible: boolean; isHovered: boolean}) =>
    renderHook(() => ({subscriptAvatarBorderColor: useListItemSubscriptAvatarBorderColor(), secondaryAvatarContainerStyle: useListItemSecondaryAvatarContainerStyle()}), {
        wrapper: ({children}) => (
            <ListItemContext.Provider value={{isFocusVisible, shouldShowTooltip: false, isDisabled: false, isInteractive: true, shouldDisableAccessibleGrouping: false}}>
                <ListItemHoverContext.Provider value={isHovered}>{children}</ListItemHoverContext.Provider>
            </ListItemContext.Provider>
        ),
    });

describe('useListItemAvatarColors', () => {
    it.each([
        ['resting row blends into the sidebar', {isFocusVisible: false, isHovered: false}, SIDEBAR_COLOR, [backgroundAndBorder(SIDEBAR_COLOR), undefined, undefined]],
        [
            'visually focused row takes the focused background',
            {isFocusVisible: true, isHovered: false},
            FOCUSED_COLOR,
            [backgroundAndBorder(SIDEBAR_COLOR), backgroundAndBorder(FOCUSED_COLOR), undefined],
        ],
        [
            'hovered row takes the hovered background',
            {isFocusVisible: false, isHovered: true},
            HOVERED_COLOR,
            [backgroundAndBorder(SIDEBAR_COLOR), undefined, backgroundAndBorder(HOVERED_COLOR)],
        ],
        ['focus wins over hover', {isFocusVisible: true, isHovered: true}, FOCUSED_COLOR, [backgroundAndBorder(SIDEBAR_COLOR), backgroundAndBorder(FOCUSED_COLOR), undefined]],
    ])('%s', (_label, contextState, expectedBorderColor, expectedSecondaryStyle) => {
        const {result} = renderColors(contextState);

        expect(result.current.subscriptAvatarBorderColor).toBe(expectedBorderColor);
        expect(result.current.secondaryAvatarContainerStyle).toEqual(expectedSecondaryStyle);
    });
});
