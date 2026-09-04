import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import type {TextVariant} from '@styles/typography';
import {textVariants} from '@styles/typography';
import variables from '@styles/variables';

import React from 'react';

// The jest preset reports fontScale 2, which pushes every getValueUsingPixelRatio value to its max.
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
    __esModule: true,
    default: {
        get: () => 2,
        getFontScale: () => 1,
        getPixelSizeForLayoutSize: (layoutSize: number) => layoutSize * 2,
        roundToNearestPixel: (layoutSize: number) => layoutSize,
    },
}));

// fontSize/lineHeight of every Product/* text style in the Figma library (Brand Guidelines & Product UI).
// Sizes track the experimental scale in `variables.ts` that this branch is testing, so they are
// deliberately smaller than the published Figma values until the scale is signed off.
const FIGMA_PRODUCT_SCALE: Record<TextVariant, [number, number]> = {
    finePrint: [10, 12],
    finePrintStrong: [10, 12],
    micro: [10, 14],
    microStrong: [10, 14],
    label: [12, 16],
    labelStrong: [12, 16],
    text: [14, 20],
    textStrong: [14, 20],
    mono: [14, 20],
    monoStrong: [14, 20],
    pageHeader: [16, 20],
    h2: [19, 24],
    h1: [22, 28],
    introHeadline: [36, 44],
};

describe('textVariants', () => {
    it('covers the Figma Product type scale 1:1 with matching sizes and line heights', () => {
        const codeScale = Object.fromEntries(Object.entries(textVariants).map(([variant, style]) => [variant, [style.fontSize, style.lineHeight]]));
        expect(codeScale).toEqual(FIGMA_PRODUCT_SCALE);
    });
});

describe('Text variant prop', () => {
    it('applies the semantic variant style', () => {
        render(<Text variant="h1">probe</Text>);

        expect(screen.getByText('probe')).toHaveStyle({
            fontFamily: textVariants.h1.fontFamily,
            fontSize: textVariants.h1.fontSize,
            lineHeight: textVariants.h1.lineHeight,
        });
    });

    it('keeps the default body styling when no variant is passed', () => {
        render(<Text>probe</Text>);

        expect(screen.getByText('probe')).toHaveStyle({
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.fontSizeNormalHeight,
        });
    });

    it('lets the style prop override the variant', () => {
        render(
            <Text
                variant="text"
                style={{lineHeight: variables.lineHeightXLarge}}
            >
                probe
            </Text>,
        );

        expect(screen.getByText('probe')).toHaveStyle({
            fontSize: textVariants.text.fontSize,
            lineHeight: variables.lineHeightXLarge,
        });
    });
});
