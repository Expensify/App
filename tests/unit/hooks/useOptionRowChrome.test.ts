import {act, renderHook} from '@testing-library/react-native';

import useOptionRowChrome from '@components/LHNOptionsList/OptionRowLHN/useOptionRowChrome';

import CONST from '@src/CONST';

const FOCUSED_COLOR = '#focused';
const HOVERED_COLOR = '#hovered';
const DEFAULT_SIDEBAR = '#sidebar';
const FLAT_NAV_SELECTED_COLOR = '#flatNavSelected';
const FLAT_NAV_HOVERED_COLOR = '#flatNavHovered';

const MOCK_STYLES = {
    sidebarLinkActive: {backgroundColor: FOCUSED_COLOR},
    sidebarLinkHover: {backgroundColor: HOVERED_COLOR},
    hoveredComponentBG: {backgroundColor: FLAT_NAV_SELECTED_COLOR},
    highlightBG: {backgroundColor: FLAT_NAV_HOVERED_COLOR},
    textSupporting: {textSupporting: true},
    themeTextColor: {themeTextColor: true},
    chatLinkRowPressable: {chatLinkRowPressable: true},
    flexGrow1: {flexGrow1: true},
    optionItemAvatarNameWrapper: {optionItemAvatarNameWrapper: true},
    optionRow: {optionRow: true},
    optionRowCompact: {optionRowCompact: true},
    justifyContentCenter: {justifyContentCenter: true},
    flex1: {flex1: true},
    flexRow: {flexRow: true},
    overflowHidden: {overflowHidden: true},
};

const MOCK_THEME = {sidebar: DEFAULT_SIDEBAR};

const MOCK_STYLE_UTILS = {
    getCompactContentContainerStyles: () => ({getCompactContentContainerStyles: true}),
};

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: jest.fn(() => MOCK_THEME),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(() => MOCK_STYLES),
}));

jest.mock('@hooks/useStyleUtils', () => ({
    __esModule: true,
    default: jest.fn(() => MOCK_STYLE_UTILS),
}));

describe('useOptionRowChrome', () => {
    describe('avatarBackgroundColor precedence', () => {
        it('returns the default sidebar color when neither focused nor hovered', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            expect(result.current.avatarBackgroundColor).toBe(DEFAULT_SIDEBAR);
        });

        it('returns the focused color when isOptionFocused is true', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            expect(result.current.avatarBackgroundColor).toBe(FOCUSED_COLOR);
        });

        it('returns the hovered color when hovered and not focused', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            act(() => {
                result.current.setHovered(true);
            });

            expect(result.current.avatarBackgroundColor).toBe(HOVERED_COLOR);
        });

        it('focused beats hovered when both are true', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            act(() => {
                result.current.setHovered(true);
            });

            expect(result.current.avatarBackgroundColor).toBe(FOCUSED_COLOR);
        });
    });

    describe('layout styles by viewMode', () => {
        it('default viewMode uses optionRow in sidebarInnerRowStyle', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            expect(result.current.sidebarInnerRowStyle).toMatchObject({optionRow: true});
            expect(result.current.sidebarInnerRowStyle).not.toMatchObject({optionRowCompact: true});
        });

        it('compact viewMode uses optionRowCompact in sidebarInnerRowStyle', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.COMPACT, shouldUseFlatNavigationBar: false}));

            expect(result.current.sidebarInnerRowStyle).toMatchObject({optionRowCompact: true});
            expect(result.current.sidebarInnerRowStyle).not.toMatchObject({optionRow: true});
        });

        it('default viewMode returns flex1 contentContainerStyles', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            expect(result.current.contentContainerStyles).toEqual([MOCK_STYLES.flex1]);
        });

        it('compact viewMode returns the compact content container set', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.COMPACT, shouldUseFlatNavigationBar: false}));

            expect(result.current.contentContainerStyles).toEqual([MOCK_STYLES.flex1, MOCK_STYLES.flexRow, MOCK_STYLES.overflowHidden, MOCK_STYLE_UTILS.getCompactContentContainerStyles()]);
        });
    });
    describe('with the flat navigation bar', () => {
        it("gives a focused row the bar's selected background, also behind the avatar", () => {
            // Given the flat navigation bar is shown and the row is the open report
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: true}));

            // Then the row and its avatar use the bar's selected background instead of the sidebar's, so they look like the bar's rows
            expect(result.current.selectedStyle).toEqual(MOCK_STYLES.hoveredComponentBG);
            expect(result.current.avatarBackgroundColor).toBe(FLAT_NAV_SELECTED_COLOR);
        });

        it("gives a hovered row the bar's hover background, also behind the avatar", () => {
            // Given the flat navigation bar is shown and the row is not the open report
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: true}));

            // When the row is hovered
            act(() => {
                result.current.setHovered(true);
            });

            // Then the row and its avatar use the bar's hover background, so the avatar's cut out stays the row's color
            expect(result.current.hoveredStyle).toEqual(MOCK_STYLES.highlightBG);
            expect(result.current.avatarBackgroundColor).toBe(FLAT_NAV_HOVERED_COLOR);
        });

        it('returns no overrides when the bar is not shown', () => {
            // Given the flat navigation bar is not shown
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT, shouldUseFlatNavigationBar: false}));

            // Then the row keeps the sidebar's own backgrounds, as for users without the beta
            expect(result.current.selectedStyle).toBeUndefined();
            expect(result.current.hoveredStyle).toBeUndefined();
        });
    });
});
