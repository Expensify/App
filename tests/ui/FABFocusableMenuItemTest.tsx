import {render, renderHook, screen} from '@testing-library/react-native';

import useThemeStyles from '@hooks/useThemeStyles';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import {FABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {FABMenuContextType} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';
import type {StyleProp, View as ViewType, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';

const TILE_ICON_TEST_ID = 'tile-icon';
const ROW_TEST_ID = 'menu-row';
// A plain icon component, because the tile only takes over a single non-string, non-array icon
// eslint-disable-next-line react/function-component-definition
const ROW_ICON = () => null;
const ROW_ICON_LABEL = String(ROW_ICON);

// The row and the icon are replaced with markers, so these tests assert what the item hands them, not how they draw themselves.
jest.mock('@components/FocusableMenuItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {createElement}: typeof React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {View}: {View: typeof ViewType} = require('react-native');
    return {
        __esModule: true,
        // Like MenuItem, the row style goes first, then the compact popover styles of a wide menu, then the wrapper style
        default: ({
            leftComponent,
            icon,
            style,
            wrapperStyle,
            labelStyle,
        }: {
            leftComponent?: React.ReactNode;
            icon?: unknown;
            style?: StyleProp<ViewStyle>;
            wrapperStyle?: StyleProp<ViewStyle>;
            labelStyle?: StyleProp<ViewStyle>;
        }) =>
            createElement(
                View,
                {testID: 'menu-row', accessibilityLabel: String(icon), style: [style, {paddingVertical: 4, minHeight: 40}, wrapperStyle]},
                leftComponent,
                createElement(View, {testID: 'menu-label', style: labelStyle}),
            ),
    };
});

jest.mock('@components/Icon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {createElement}: typeof React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {View}: {View: typeof ViewType} = require('react-native');
    return {
        __esModule: true,
        default: ({src, fill}: {src: unknown; fill: string}) =>
            createElement(View, {
                testID: 'tile-icon',
                accessibilityLabel: `${String(src)}|${fill}`,
            }),
    };
});

// Each lazily loaded icon resolves to its own name, so the tests can tell which one the tile drew.
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_target, name) => String(name)}),
}));

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));

function createContext(overrides: Partial<FABMenuContextType> = {}): FABMenuContextType {
    return {
        focusedIndex: -1,
        setFocusedIndex: jest.fn(),
        onItemPress: jest.fn(),
        isVisible: true,
        registeredItems: [],
        registerItem: jest.fn(),
        unregisterItem: jest.fn(),
        shouldShowIconTiles: false,
        ...overrides,
    };
}

function renderItem(itemId: string, context: FABMenuContextType, props: {isVisible?: boolean; icon?: ComponentProps<typeof FABFocusableMenuItem>['icon']} = {}) {
    return render(
        <FABMenuContext.Provider value={context}>
            <FABFocusableMenuItem
                itemId={itemId}
                title="Title"
                sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
                icon={props.icon}
                isVisible={props.isVisible}
            />
        </FABMenuContext.Provider>,
    );
}

describe('FABFocusableMenuItem', () => {
    beforeEach(() => {
        mockShouldUseNarrowLayout = false;
    });

    const {result} = renderHook(() => useThemeStyles());
    // The divider composes the shared line style with its spacing, so it is found by the line's height and color in its flattened style
    const hasDivider = () =>
        screen.UNSAFE_root.findAll((node) => {
            const flatStyle: unknown = typeof node.type === 'string' ? StyleSheet.flatten(node.props.style) : undefined;
            return (
                typeof flatStyle === 'object' &&
                flatStyle !== null &&
                'height' in flatStyle &&
                'backgroundColor' in flatStyle &&
                flatStyle.height === result.current.sectionDividerLine.height &&
                flatStyle.backgroundColor === result.current.sectionDividerLine.backgroundColor
            );
        }).length > 0;

    it('renders the regular row without a tile or divider when icon tiles are off', () => {
        // Given the menu does not show icon tiles
        const context = createContext({shouldShowIconTiles: false});

        // When a row that would get a tile and a divider is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE, context, {
            icon: ROW_ICON,
        });

        // Then the old rendering stays: the row keeps its own icon and no tile or divider appears
        expect(screen.getByTestId(ROW_TEST_ID).props.accessibilityLabel).toBe(ROW_ICON_LABEL);
        expect(screen.queryByTestId(TILE_ICON_TEST_ID)).toBeNull();
        expect(hasDivider()).toBe(false);
    });

    it('renders the tile icon and clears the row icon when icon tiles are on', () => {
        // Given the menu shows icon tiles
        const context = createContext({shouldShowIconTiles: true});

        // When a row with a design icon is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.EXPENSE, context, {icon: ROW_ICON});

        // Then the tile draws the design icon in its color and the row drops its own icon
        expect(screen.getByTestId(TILE_ICON_TEST_ID).props.accessibilityLabel).toBe(`ReceiptMultiple|${colors.green200}`);
        expect(screen.getByTestId(ROW_TEST_ID).props.accessibilityLabel).toBe('undefined');
    });

    it('falls back to the row icon on the tile when the design has no icon (quick action)', () => {
        // Given icon tiles are on and the quick action tile has no design icon
        const context = createContext({shouldShowIconTiles: true});

        // When the quick action row is rendered with its own icon
        renderItem(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, context, {
            icon: ROW_ICON,
        });

        // Then the tile draws the icon the row passed in
        expect(screen.getByTestId(TILE_ICON_TEST_ID).props.accessibilityLabel).toBe(`${ROW_ICON_LABEL}|${colors.green200}`);
    });

    it('keeps the default rendering for a row with an unknown id when icon tiles are on', () => {
        // Given icon tiles are on but the id has no tile
        const context = createContext({shouldShowIconTiles: true});

        // When the row is rendered
        renderItem('unknown-item', context, {icon: ROW_ICON});

        // Then there is no tile and the row keeps its icon
        expect(screen.queryByTestId(TILE_ICON_TEST_ID)).toBeNull();
        expect(screen.getByTestId(ROW_TEST_ID).props.accessibilityLabel).toBe(ROW_ICON_LABEL);
    });

    it.each([
        [CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE, true],
        [CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, true],
        [CONST.FAB_MENU_ITEM_IDS.EXPENSE, false],
        [CONST.FAB_MENU_ITEM_IDS.TRAVEL, false],
    ])('shows a divider above "%s": %s', (itemId, expected) => {
        // Given icon tiles are on
        const context = createContext({shouldShowIconTiles: true});

        // When the row is rendered
        renderItem(itemId, context, {icon: ROW_ICON});

        // Then only the rows that set themselves apart from the create actions get a divider
        expect(hasDivider()).toBe(expected);
    });

    it.each([
        ['wide', false, 52],
        ['narrow', true, 64],
    ])('sets the tile row to its design height on a %s layout', (_layout, shouldUseNarrowLayout, expectedMinHeight) => {
        // Given icon tiles are on and the layout is narrow (mobile) or wide (web)
        mockShouldUseNarrowLayout = shouldUseNarrowLayout;
        const context = createContext({shouldShowIconTiles: true});

        // When a tile row is rendered, here the quick action row whose description drops the fixed compact height
        renderItem(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, context, {icon: ROW_ICON});

        // Then the row is as tall as the design asks for that layout, 64px on mobile and 52px on web, even after the compact popover styles
        expect(StyleSheet.flatten(screen.getByTestId(ROW_TEST_ID).props.style)).toEqual(expect.objectContaining({minHeight: expectedMinHeight, paddingTop: 0, paddingBottom: 0}));
    });

    it('moves the section label closer to the divider when icon tiles are on', () => {
        // Given icon tiles are on, so the quick action row gets a divider above its "Quick action" label
        const context = createContext({shouldShowIconTiles: true});

        // When the quick action row is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, context, {icon: ROW_ICON});

        // Then the label uses the tighter spacing, so the divider and label take 45px like in the design
        expect(StyleSheet.flatten(screen.getByTestId('menu-label').props.style)).toEqual({paddingTop: 6, paddingBottom: 2});
    });

    it('keeps the row label spacing untouched when icon tiles are off', () => {
        // Given the menu does not show icon tiles
        const context = createContext({shouldShowIconTiles: false});

        // When the quick action row is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION, context, {icon: ROW_ICON});

        // Then the label keeps the spacing the row passes in, so the old menu looks as before
        expect(screen.getByTestId('menu-label').props.style).toBeUndefined();
    });

    it('keeps the row height untouched when icon tiles are off', () => {
        // Given the menu does not show icon tiles on a narrow layout
        mockShouldUseNarrowLayout = true;
        const context = createContext({shouldShowIconTiles: false});

        // When a row is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.EXPENSE, context, {icon: ROW_ICON});

        // Then the row keeps the menu's default sizing, so menus without tiles look as before
        expect(StyleSheet.flatten(screen.getByTestId(ROW_TEST_ID).props.style)).toEqual(expect.objectContaining({paddingVertical: 4, minHeight: 40}));
        expect(StyleSheet.flatten(screen.getByTestId(ROW_TEST_ID).props.style)).not.toHaveProperty('paddingTop');
    });

    it('renders nothing when the item is not visible', () => {
        // Given icon tiles are on
        const context = createContext({shouldShowIconTiles: true});

        // When a hidden row is rendered
        renderItem(CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE, context, {
            isVisible: false,
            icon: ROW_ICON,
        });

        // Then neither the row, the tile nor the divider is output
        expect(screen.queryByTestId(ROW_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(TILE_ICON_TEST_ID)).toBeNull();
        expect(hasDivider()).toBe(false);
    });
});
