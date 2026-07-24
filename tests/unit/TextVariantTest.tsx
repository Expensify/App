import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import {textVariants} from '@styles/typography';
import variables from '@styles/variables';

import React from 'react';

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
