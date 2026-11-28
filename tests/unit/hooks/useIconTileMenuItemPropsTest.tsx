import {renderHook} from '@testing-library/react-native';

import getFABMenuIconTile from '@pages/inbox/sidebar/FABPopoverContent/getFABMenuIconTile';
import useIconTileMenuItemProps from '@pages/inbox/sidebar/FABPopoverContent/useIconTileMenuItemProps';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import {StyleSheet} from 'react-native';

const mockIsBetaEnabled = jest.fn();
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: mockIsBetaEnabled})));

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));

const ROW_ICON: IconAsset = {uri: 'row-icon'};

describe('useIconTileMenuItemProps', () => {
    beforeEach(() => {
        mockIsBetaEnabled.mockReset();
        mockShouldUseNarrowLayout = false;
    });

    it('keeps the regular row icon without the flat navigation beta', () => {
        // Given the flat navigation beta is off, so the menus keep their current look
        mockIsBetaEnabled.mockReturnValue(false);
        const {result} = renderHook(() => useIconTileMenuItemProps());

        // When the props for a row with a tile are requested
        const props = result.current(CONST.FAB_MENU_ITEM_IDS.EXPENSE, ROW_ICON);

        // Then nothing is overridden and the row renders as before
        expect(props).toEqual({});
    });

    it('keeps the regular row icon when the row has no tile', () => {
        // Given the flat navigation beta is on
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.FLAT_NAV);
        const {result} = renderHook(() => useIconTileMenuItemProps());

        // When the props for a row without a tile are requested
        const props = result.current('not-a-create-menu-row', ROW_ICON);

        // Then nothing is overridden, so a row the design has no tile for still shows its icon
        expect(props).toEqual({});
    });

    it('moves the icon onto the tile with the flat navigation beta', () => {
        // Given the flat navigation beta is on
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.FLAT_NAV);
        const {result} = renderHook(() => useIconTileMenuItemProps());

        // When the props for the quick action row, whose tile has no icon of its own, are requested
        const props = result.current(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, ROW_ICON);

        // Then the row drops its own icon and renders the tile, drawing the row icon because the tile has none of its own
        expect(props.icon).toBeUndefined();
        expect(props.displayInDefaultIconColor).toBe(false);
        expect(props.leftComponent).toEqual(expect.objectContaining({props: {tile: getFABMenuIconTile(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION), fallbackIcon: ROW_ICON}}));
    });

    it('keeps the regular row icon when neither the tile nor the row has an icon to draw', () => {
        // Given the flat navigation beta is on
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.FLAT_NAV);
        const {result} = renderHook(() => useIconTileMenuItemProps());

        // When the props for a row whose tile has no icon and which passes no icon are requested
        const props = result.current(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, undefined);

        // Then nothing is overridden, since an empty colored square would carry no meaning
        expect(props).toEqual({});
    });

    it.each([
        {layout: 'narrow', shouldUseNarrowLayout: true, expectedMinHeight: variables.optionRowHeight},
        {layout: 'wide', shouldUseNarrowLayout: false, expectedMinHeight: variables.optionRowHeightCompact},
    ])('gives a tile row the create menu height on a $layout layout', ({shouldUseNarrowLayout, expectedMinHeight}) => {
        // Given the flat navigation beta is on, on a layout that sets the create menu row height
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.FLAT_NAV);
        mockShouldUseNarrowLayout = shouldUseNarrowLayout;
        const {result} = renderHook(() => useIconTileMenuItemProps());

        // When the props for a row with a tile are requested
        const props = result.current(CONST.FAB_MENU_ITEM_IDS.EXPENSE, ROW_ICON);

        // Then the row skips the compact popover styles, which would cap it below the tile height, and takes the create menu height instead
        expect(props.shouldIgnoreCompactStyle).toBe(true);
        expect(StyleSheet.flatten(props.style)).toEqual(expect.objectContaining({minHeight: expectedMinHeight}));
    });
});
