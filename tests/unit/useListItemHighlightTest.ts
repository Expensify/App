import {renderHook} from '@testing-library/react-native';

import useListItemHighlight from '@components/SelectionList/ListItemComposed/hooks/useListItemHighlight';

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

type HookParams = Parameters<typeof useListItemHighlight>[0];

function renderHighlightHook(params?: HookParams) {
    const {result} = renderHook(() => ({
        styles: useThemeStyles(),
        StyleUtils: useStyleUtils(),
        theme: useTheme(),
        highlight: useListItemHighlight(params),
    }));
    return result.current;
}

describe('useListItemHighlight', () => {
    beforeEach(() => {
        mockUseAnimatedHighlightStyle.mockClear();
        mockIsLargeScreenWidth = false;
    });

    describe('animation config', () => {
        it('configures the default variant with the selection list border radius and full style application', () => {
            const {styles, theme} = renderHighlightHook({shouldHighlight: true});

            expect(mockUseAnimatedHighlightStyle).toHaveBeenCalledWith({
                borderRadius: styles.selectionListPressableItemWrapper.borderRadius,
                shouldHighlight: true,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: true,
            });
        });

        it.each([
            ['wide', true],
            ['narrow', false],
        ])('configures the searchTable variant on %s screens with the table border radius and layout styles only off-table', (_name, isLargeScreenWidth) => {
            mockIsLargeScreenWidth = isLargeScreenWidth;
            const {StyleUtils, theme} = renderHighlightHook({variant: 'searchTable'});

            expect(mockUseAnimatedHighlightStyle).toHaveBeenCalledWith({
                borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
                shouldHighlight: false,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: !isLargeScreenWidth,
            });
        });
    });

    describe('default variant pressable bundle', () => {
        it('rests on the wrapper style and margins', () => {
            const {styles, highlight} = renderHighlightHook();

            expect(highlight.pressableStyle).toContain(styles.selectionListPressableItemWrapper);
            expect(highlight.pressableStyle).toContain(styles.mh0);
            expect(highlight.pressableStyle).not.toContain(styles.bgTransparent);
            expect(highlight.pressableWrapperStyle).toContain(styles.mh5);
            expect(highlight.pressableWrapperStyle).toContain(animatedHighlightStyleMock);
        });

        it('goes transparent while highlighting so the animated background shows through', () => {
            const {styles, highlight} = renderHighlightHook({shouldHighlight: true});

            expect(highlight.pressableStyle).toContain(styles.bgTransparent);
        });

        it('paints the selected background when selected', () => {
            const {styles, highlight} = renderHighlightHook({isSelected: true});

            expect(highlight.pressableStyle).toContain(styles.activeComponentBG);
        });
    });

    describe('searchTable variant pressable bundle', () => {
        it('adds table paddings and stays transparent for the animated background', () => {
            const {styles, highlight} = renderHighlightHook({variant: 'searchTable'});

            expect(highlight.pressableStyle).toContain(styles.pv3);
            expect(highlight.pressableStyle).toContain(styles.ph3);
            expect(highlight.pressableStyle).toContain(styles.bgTransparent);
        });

        it('applies the table row pressable style on wide screens', () => {
            mockIsLargeScreenWidth = true;
            const {StyleUtils, highlight} = renderHighlightHook({variant: 'searchTable', isSelected: true, isLastItem: true});

            expect(highlight.pressableStyle).toContainEqual(StyleUtils.getSearchTableRowPressableStyle(true, true, {vertical: variables.tableRowPaddingVertical}));
        });

        it('rounds and clips the last row on wide screens', () => {
            mockIsLargeScreenWidth = true;
            const {styles, highlight} = renderHighlightHook({variant: 'searchTable', isLastItem: true});

            expect(highlight.pressableWrapperStyle).toContainEqual([styles.tableBottomRadius, styles.overflowHidden]);
        });

        it('skips the last-row rounding on narrow screens', () => {
            const {styles, highlight} = renderHighlightHook({variant: 'searchTable', isLastItem: true});

            expect(highlight.pressableWrapperStyle).not.toContainEqual([styles.tableBottomRadius, styles.overflowHidden]);
        });
    });

    it('returns the animated highlight style for rows that own their pressable layout', () => {
        const {highlight} = renderHighlightHook();

        expect(highlight.animatedHighlightStyle).toBe(animatedHighlightStyleMock);
    });
});
