import {render, renderHook, screen} from '@testing-library/react-native';

import useThemeStyles from '@hooks/useThemeStyles';

import FABPopoverMenu from '@pages/inbox/sidebar/FABPopoverContent/FABPopoverMenu';

import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

const MENU_CONTENT_TEST_ID = 'menu-content';

// The popover and the focus trap only wrap the menu, so they render their children directly and the test sees the menu layout.
jest.mock(
    '@components/PopoverWithMeasuredContent',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/FocusTrap/FocusTrapForModal',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

// The hook echoes the padding it is asked for, without a safe-area inset, so the test can read the padding the menu requests.
jest.mock('@hooks/useBottomSafeSafeAreaPaddingStyle', () => ({style, additionalPaddingBottom}: {style: StyleProp<ViewStyle>; additionalPaddingBottom: number}) => [
    style,
    {paddingBottom: additionalPaddingBottom},
]);

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));

function renderMenu(shouldShowIconTiles: boolean) {
    const anchorRef = {current: null};
    render(
        <FABPopoverMenu
            isVisible
            onClose={jest.fn()}
            anchorRef={anchorRef}
            shouldShowIconTiles={shouldShowIconTiles}
        >
            <View testID={MENU_CONTENT_TEST_ID} />
        </FABPopoverMenu>,
    );

    // The content wrapper holds the padding, and two levels above it sits the container that sets the width of the menu
    const contentWrapper = screen.getByTestId(MENU_CONTENT_TEST_ID).parent?.parent;
    return {contentWrapper, container: contentWrapper?.parent?.parent};
}

describe('FABPopoverMenu', () => {
    const {result} = renderHook(() => useThemeStyles());

    beforeEach(() => {
        mockShouldUseNarrowLayout = false;
    });

    it.each([
        ['wide', false],
        ['narrow', true],
    ])('pads the menu by 12px above and below the rows on a %s layout when icon tiles are on', (_layout, shouldUseNarrowLayout) => {
        // Given the menu shows icon tiles on a narrow (mobile) or wide (web) layout
        mockShouldUseNarrowLayout = shouldUseNarrowLayout;

        // When the menu is rendered
        const {contentWrapper} = renderMenu(true);

        // Then the rows get the same 12px space above and below them as in the design, on every layout
        expect(contentWrapper).toHaveStyle({paddingTop: variables.flatNavigationBarCreateMenuPaddingVertical, paddingBottom: variables.flatNavigationBarCreateMenuPaddingVertical});
    });

    it.each([
        ['wide', false, 8],
        ['narrow', true, 16],
    ])('keeps the old padding on a %s layout when icon tiles are off', (_layout, shouldUseNarrowLayout, expectedPadding) => {
        // Given the menu does not show icon tiles, as for users without the flat nav beta
        mockShouldUseNarrowLayout = shouldUseNarrowLayout;

        // When the menu is rendered
        const {contentWrapper} = renderMenu(false);

        // Then the padding stays as before, so the menu without the beta does not change
        expect(contentWrapper).toHaveStyle({paddingTop: expectedPadding, paddingBottom: expectedPadding});
    });

    it('narrows the menu to the design width on a wide layout when icon tiles are on', () => {
        // Given the menu shows icon tiles on a wide layout
        // When the menu is rendered
        const {container} = renderMenu(true);

        // Then the menu is 300px wide, as in the design
        expect(container).toHaveStyle({width: variables.flatNavigationBarCreateMenuWidth});
    });

    it('keeps the old menu width on a wide layout when icon tiles are off', () => {
        // Given the menu does not show icon tiles, as for users without the flat nav beta
        // When the menu is rendered
        const {container} = renderMenu(false);

        // Then the menu keeps the width it had before
        expect(container).toHaveStyle({width: result.current.createMenuContainer.width});
    });
});
