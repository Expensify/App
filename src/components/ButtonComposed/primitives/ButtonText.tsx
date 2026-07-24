import {useButtonContext} from '@components/ButtonComposed/context';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type ButtonTextProps = {
    /** The text to display */
    children: string;

    /** The number of lines to display */
    numberOfLines?: number;

    /** Additional text styles */
    style?: StyleProp<TextStyle>;

    /** Additional text styles to apply when the button is hovered. */
    hoverStyle?: StyleProp<TextStyle>;
};

function ButtonText({children, numberOfLines = 1, style, hoverStyle}: ButtonTextProps) {
    const {variant, size, isHovered} = useButtonContext();
    const styles = useThemeStyles();

    const sizeTextStyles = {
        [CONST.BUTTON_SIZE.SMALL]: styles.buttonSmallText,
        [CONST.BUTTON_SIZE.MEDIUM]: styles.buttonMediumText,
        [CONST.BUTTON_SIZE.LARGE]: styles.buttonLargeText,
    };

    const variantTextStyles = {
        success: styles.buttonSuccessText,
        danger: styles.buttonDangerText,
    };

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[
                numberOfLines !== 1 && styles.breakAll,
                styles.pointerEventsNone,
                styles.buttonText,
                styles.flexShrink1,
                sizeTextStyles[size],
                variant ? variantTextStyles[variant] : undefined,
                styles.ph1,
                style,
                isHovered && hoverStyle,
            ]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            {children}
        </Text>
    );
}

export default ButtonText;
export type {ButtonTextProps};
