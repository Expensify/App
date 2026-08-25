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
const FIGMA_PRODUCT_SCALE: Record<TextVariant, [number, number]> = {
    finePrint: [9, 12],
    finePrintStrong: [9, 12],
    micro: [11, 14],
    microStrong: [11, 14],
    label: [13, 16],
    labelStrong: [13, 16],
    text: [15, 20],
    textStrong: [15, 20],
    mono: [15, 20],
    monoStrong: [15, 20],
    pageHeader: [17, 20],
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
