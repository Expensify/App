import {act, renderHook} from '@testing-library/react-native';
import useOptionRowChrome from '@components/LHNOptionsList/OptionRowLHN/useOptionRowChrome';
import CONST from '@src/CONST';

const FOCUSED_COLOR = '#focused';
const HOVERED_COLOR = '#hovered';
const DEFAULT_SIDEBAR = '#sidebar';

const MOCK_STYLES = {
    sidebarLinkActive: {backgroundColor: FOCUSED_COLOR},
    sidebarLinkHover: {backgroundColor: HOVERED_COLOR},
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
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT}));

            expect(result.current.avatarBackgroundColor).toBe(DEFAULT_SIDEBAR);
        });

        it('returns the focused color when isOptionFocused is true', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT}));

            expect(result.current.avatarBackgroundColor).toBe(FOCUSED_COLOR);
        });

        it('returns the hovered color when hovered and not focused', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT}));

            act(() => {
                result.current.setHovered(true);
            });

            expect(result.current.avatarBackgroundColor).toBe(HOVERED_COLOR);
        });

        it('focused beats hovered when both are true', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: true, viewMode: CONST.OPTION_MODE.DEFAULT}));

            act(() => {
                result.current.setHovered(true);
            });

            expect(result.current.avatarBackgroundColor).toBe(FOCUSED_COLOR);
        });
    });

    describe('layout styles by viewMode', () => {
        it('default viewMode uses optionRow in sidebarInnerRowStyle', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT}));

            expect(result.current.sidebarInnerRowStyle).toMatchObject({optionRow: true});
            expect(result.current.sidebarInnerRowStyle).not.toMatchObject({optionRowCompact: true});
        });

        it('compact viewMode uses optionRowCompact in sidebarInnerRowStyle', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.COMPACT}));

            expect(result.current.sidebarInnerRowStyle).toMatchObject({optionRowCompact: true});
            expect(result.current.sidebarInnerRowStyle).not.toMatchObject({optionRow: true});
        });

        it('default viewMode returns flex1 contentContainerStyles', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.DEFAULT}));

            expect(result.current.contentContainerStyles).toEqual([MOCK_STYLES.flex1]);
        });

        it('compact viewMode returns the compact content container set', () => {
            const {result} = renderHook(() => useOptionRowChrome({isOptionFocused: false, viewMode: CONST.OPTION_MODE.COMPACT}));

            expect(result.current.contentContainerStyles).toEqual([MOCK_STYLES.flex1, MOCK_STYLES.flexRow, MOCK_STYLES.overflowHidden, MOCK_STYLE_UTILS.getCompactContentContainerStyles()]);
        });
    });
});
