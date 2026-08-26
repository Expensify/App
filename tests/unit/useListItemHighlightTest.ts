import {renderHook} from '@testing-library/react-native';

import useListItemHighlight from '@components/SelectionList/ListItemComposed/hooks/useListItemHighlight';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

const animatedHighlightStyleMock = {backgroundColor: 'animated-highlight'};
jest.mock('@hooks/useAnimatedHighlightStyle', () => jest.fn(() => animatedHighlightStyleMock));

const mockUseAnimatedHighlightStyle = jest.mocked(useAnimatedHighlightStyle);

type HookParams = Parameters<typeof useListItemHighlight>[0];

function renderHighlightHook(params?: HookParams) {
    const {result} = renderHook(() => ({
        styles: useThemeStyles(),
        theme: useTheme(),
        highlight: useListItemHighlight(params),
    }));
    return result.current;
}

describe('useListItemHighlight', () => {
    beforeEach(() => {
        mockUseAnimatedHighlightStyle.mockClear();
    });

    it('configures the animation with the selection list border radius and full style application', () => {
        const {styles, theme} = renderHighlightHook({shouldHighlight: true});

        expect(mockUseAnimatedHighlightStyle).toHaveBeenCalledWith({
            borderRadius: styles.selectionListPressableItemWrapper.borderRadius,
            shouldHighlight: true,
            highlightColor: theme.messageHighlightBG,
            backgroundColor: theme.highlightBG,
            shouldApplyOtherStyles: true,
        });
    });

    it('rests on the wrapper style and margins, staying transparent for the animated background', () => {
        const {styles, highlight} = renderHighlightHook();

        expect(highlight.pressableStyle).toContain(styles.selectionListPressableItemWrapper);
        expect(highlight.pressableStyle).toContain(styles.mh0);
        // Unconditional even when not highlighting: the highlight flag resets mid-animation, so an opaque
        // background here would mask the still-running animation on the wrapper underneath.
        expect(highlight.pressableStyle).toContain(styles.bgTransparent);
        expect(highlight.pressableWrapperStyle).toContain(styles.mh5);
        expect(highlight.pressableWrapperStyle).toContain(animatedHighlightStyleMock);
    });

    it('paints the selected background when selected', () => {
        const {styles, highlight} = renderHighlightHook({isSelected: true});

        expect(highlight.pressableStyle).toContain(styles.activeComponentBG);
    });

    it('returns the animated highlight style for rows that own their pressable layout', () => {
        const {highlight} = renderHighlightHook();

        expect(highlight.animatedHighlightStyle).toBe(animatedHighlightStyleMock);
    });
});
