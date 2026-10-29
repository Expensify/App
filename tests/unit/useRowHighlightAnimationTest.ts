import {renderHook} from '@testing-library/react-native';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

const animatedHighlightStyleMock = {backgroundColor: 'animated-highlight'};
jest.mock('@hooks/useAnimatedHighlightStyle', () => jest.fn(() => animatedHighlightStyleMock));

const mockUseAnimatedHighlightStyle = jest.mocked(useAnimatedHighlightStyle);

type HookParams = Parameters<typeof useRowHighlightAnimation>[0];
type AnimationParams = Parameters<typeof useAnimatedHighlightStyle>[0];
type ExpectedAnimation = (theme: ReturnType<typeof useTheme>) => AnimationParams;

function renderRowHighlightAnimation(params?: HookParams) {
    const {result} = renderHook(() => ({
        theme: useTheme(),
        highlightStyle: useRowHighlightAnimation(params),
    }));
    return result.current;
}

describe('useRowHighlightAnimation', () => {
    beforeEach(() => {
        mockUseAnimatedHighlightStyle.mockClear();
    });

    it.each<[string, HookParams, ExpectedAnimation]>([
        [
            'defaults to the component radius, the resting background and full style application',
            {shouldHighlight: true},
            (theme) => ({
                borderRadius: variables.componentBorderRadius,
                shouldHighlight: true,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: true,
            }),
        ],
        [
            'rests a selected row on the selected background',
            {isSelected: true},
            (theme) => ({
                borderRadius: variables.componentBorderRadius,
                shouldHighlight: false,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.activeComponentBG,
                shouldApplyOtherStyles: true,
            }),
        ],
        [
            'keeps the resting background for an unselected row',
            {isSelected: false},
            (theme) => ({
                borderRadius: variables.componentBorderRadius,
                shouldHighlight: false,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: true,
            }),
        ],
        [
            'skips the layout styles for rows that round their own corners',
            {shouldApplyOtherStyles: false},
            (theme) => ({
                borderRadius: variables.componentBorderRadius,
                shouldHighlight: false,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: false,
            }),
        ],
        [
            'passes a custom radius for rows that square their edges',
            {borderRadius: 0},
            (theme) => ({
                borderRadius: 0,
                shouldHighlight: false,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: true,
            }),
        ],
        [
            'combines every search-row flag: squared corners, no layout styles, selected background',
            {shouldHighlight: true, isSelected: true, borderRadius: 0, shouldApplyOtherStyles: false},
            (theme) => ({
                borderRadius: 0,
                shouldHighlight: true,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.activeComponentBG,
                shouldApplyOtherStyles: false,
            }),
        ],
        [
            'forwards the immediate-entry overrides for rows already on screen',
            {shouldHighlight: true, skipInitialFade: true, itemEnterDelay: 0},
            (theme) => ({
                borderRadius: variables.componentBorderRadius,
                shouldHighlight: true,
                highlightColor: theme.messageHighlightBG,
                backgroundColor: theme.highlightBG,
                shouldApplyOtherStyles: true,
                skipInitialFade: true,
                itemEnterDelay: 0,
            }),
        ],
    ])('%s', (_name, params, expected) => {
        const {theme} = renderRowHighlightAnimation(params);

        expect(mockUseAnimatedHighlightStyle).toHaveBeenCalledWith(expected(theme));
    });

    it('returns the animated highlight style', () => {
        const {highlightStyle} = renderRowHighlightAnimation();

        expect(highlightStyle).toBe(animatedHighlightStyleMock);
    });
});
