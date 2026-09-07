import {renderHook} from '@testing-library/react-native';

import useSearchTableItemHighlight from '@components/Search/SearchList/ListItem/hooks/useSearchTableItemHighlight';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

const animatedHighlightStyleMock = {backgroundColor: 'animated-highlight'};
jest.mock('@hooks/useAnimatedHighlightStyle', () => jest.fn(() => animatedHighlightStyleMock));

let mockIsLargeScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({isLargeScreenWidth: mockIsLargeScreenWidth}));

const mockUseAnimatedHighlightStyle = jest.mocked(useAnimatedHighlightStyle);

type HookParams = Parameters<typeof useSearchTableItemHighlight>[0];

function renderHighlightHook(params?: HookParams) {
    const {result} = renderHook(() => ({
        styles: useThemeStyles(),
        StyleUtils: useStyleUtils(),
        theme: useTheme(),
        highlight: useSearchTableItemHighlight(params),
    }));
    return result.current;
}

describe('useSearchTableItemHighlight', () => {
    beforeEach(() => {
        mockUseAnimatedHighlightStyle.mockClear();
        mockIsLargeScreenWidth = false;
    });

    it.each([
        ['wide', true],
        ['narrow', false],
    ])('configures the animation on %s screens with the table border radius and layout styles only off-table', (_name, isLargeScreenWidth) => {
        mockIsLargeScreenWidth = isLargeScreenWidth;
        const {StyleUtils, theme} = renderHighlightHook();

        expect(mockUseAnimatedHighlightStyle).toHaveBeenCalledWith({
            borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
            shouldHighlight: false,
            highlightColor: theme.messageHighlightBG,
            backgroundColor: theme.highlightBG,
            shouldApplyOtherStyles: !isLargeScreenWidth,
        });
    });

    it('adds table paddings and stays transparent for the animated background', () => {
        const {styles, highlight} = renderHighlightHook();

        expect(highlight.pressableStyle).toContain(styles.pv3);
        expect(highlight.pressableStyle).toContain(styles.ph3);
        expect(highlight.pressableStyle).toContain(styles.bgTransparent);
    });

    it('paints the selected background when selected', () => {
        const {styles, highlight} = renderHighlightHook({isSelected: true});

        expect(highlight.pressableStyle).toContain(styles.activeComponentBG);
    });

    it('applies the table row pressable style on wide screens', () => {
        mockIsLargeScreenWidth = true;
        const {StyleUtils, highlight} = renderHighlightHook({isSelected: true, isLastItem: true});

        expect(highlight.pressableStyle).toContainEqual(StyleUtils.getSearchTableRowPressableStyle(true, true, {vertical: variables.tableRowPaddingVertical}));
    });

    it('rounds and clips the last row on wide screens', () => {
        mockIsLargeScreenWidth = true;
        const {styles, highlight} = renderHighlightHook({isLastItem: true});

        expect(highlight.pressableWrapperStyle).toContainEqual([styles.tableBottomRadius, styles.overflowHidden]);
    });

    it('skips the last-row rounding on narrow screens', () => {
        const {styles, highlight} = renderHighlightHook({isLastItem: true});

        expect(highlight.pressableWrapperStyle).not.toContainEqual([styles.tableBottomRadius, styles.overflowHidden]);
    });

    it('returns the animated highlight style for rows that own their pressable layout', () => {
        const {highlight} = renderHighlightHook();

        expect(highlight.animatedHighlightStyle).toBe(animatedHighlightStyleMock);
    });
});
