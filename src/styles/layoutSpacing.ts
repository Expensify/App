type LayoutSpacingToken = {
    narrow: number;
    wide: number;
};

const layoutSpacing = {
    cardPadding: {narrow: 24, wide: 32},
    pageGutter: {narrow: 12, wide: 20},
    cardGap: {narrow: 12, wide: 20},
} as const satisfies Record<string, LayoutSpacingToken>;

type LayoutSpacingName = keyof typeof layoutSpacing;

function resolveLayoutSpacing(shouldUseNarrowLayout: boolean) {
    const size = shouldUseNarrowLayout ? 'narrow' : 'wide';
    const cardPadding = layoutSpacing.cardPadding[size];
    const pageGutter = layoutSpacing.pageGutter[size];

    return {
        values: {cardPadding, pageGutter},
        cardPadding: {padding: cardPadding},
        cardPaddingHorizontal: {paddingHorizontal: cardPadding},
        cardPaddingBottom: {paddingBottom: cardPadding},
        cardPaddingLeft: {paddingLeft: cardPadding},
        cardMarginHorizontal: {marginHorizontal: cardPadding},
        cardEdgeToEdge: {marginHorizontal: -cardPadding},
        pageGutter: {paddingHorizontal: pageGutter},
        pageGutterMargin: {marginHorizontal: pageGutter},
    };
}

type LayoutSpacing = ReturnType<typeof resolveLayoutSpacing>;

export default layoutSpacing;
export {resolveLayoutSpacing};
export type {LayoutSpacing, LayoutSpacingName, LayoutSpacingToken};
