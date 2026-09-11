import {renderHook} from '@testing-library/react-native';

import useLayoutSpacing from '@hooks/useLayoutSpacing';

import layoutSpacing from '@styles/layoutSpacing';

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));

describe('useLayoutSpacing', () => {
    it('resolves narrow values on a narrow layout', () => {
        mockShouldUseNarrowLayout = true;
        const {result} = renderHook(() => useLayoutSpacing());

        expect(result.current.values).toEqual({cardPadding: layoutSpacing.cardPadding.narrow, pageGutter: layoutSpacing.pageGutter.narrow, cardGap: layoutSpacing.cardGap.narrow});
        expect(result.current.cardPadding).toEqual({padding: layoutSpacing.cardPadding.narrow});
        expect(result.current.cardPaddingHorizontal).toEqual({paddingHorizontal: layoutSpacing.cardPadding.narrow});
        expect(result.current.cardEdgeToEdge).toEqual({marginHorizontal: -layoutSpacing.cardPadding.narrow});
        expect(result.current.cardPaddingBottom).toEqual({paddingBottom: layoutSpacing.cardPadding.narrow});
        expect(result.current.cardPaddingLeft).toEqual({paddingLeft: layoutSpacing.cardPadding.narrow});
        expect(result.current.cardMarginHorizontal).toEqual({marginHorizontal: layoutSpacing.cardPadding.narrow});
        expect(result.current.cardGapBottom).toEqual({marginBottom: layoutSpacing.cardGap.narrow});
        expect(result.current.pageGutter).toEqual({paddingHorizontal: layoutSpacing.pageGutter.narrow});
        expect(result.current.pageGutterMargin).toEqual({marginHorizontal: layoutSpacing.pageGutter.narrow});
        expect(result.current.pageGutterRight).toEqual({paddingRight: layoutSpacing.pageGutter.narrow});
    });

    it('resolves wide values on a wide layout', () => {
        mockShouldUseNarrowLayout = false;
        const {result} = renderHook(() => useLayoutSpacing());

        expect(result.current.values).toEqual({cardPadding: layoutSpacing.cardPadding.wide, pageGutter: layoutSpacing.pageGutter.wide, cardGap: layoutSpacing.cardGap.wide});
        expect(result.current.cardPadding).toEqual({padding: layoutSpacing.cardPadding.wide});
        expect(result.current.cardEdgeToEdge).toEqual({marginHorizontal: -layoutSpacing.cardPadding.wide});
    });
});
