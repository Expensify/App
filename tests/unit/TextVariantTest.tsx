import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import {textVariants} from '@styles/typography';
import variables from '@styles/variables';

import React from 'react';

describe('Text variant prop', () => {
    it('applies the semantic variant style', () => {
        render(<Text variant="headline">probe</Text>);

        expect(screen.getByText('probe')).toHaveStyle({
            fontFamily: textVariants.headline.fontFamily,
            fontSize: textVariants.headline.fontSize,
            lineHeight: textVariants.headline.lineHeight,
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
                variant="body"
                style={{lineHeight: variables.lineHeightXLarge}}
            >
                probe
            </Text>,
        );

        expect(screen.getByText('probe')).toHaveStyle({
            fontSize: textVariants.body.fontSize,
            lineHeight: variables.lineHeightXLarge,
        });
    });
});
