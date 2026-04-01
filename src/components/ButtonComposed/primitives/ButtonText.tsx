import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useButtonContext} from '../context';

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
    const {isLoading, variant, size, isHovered} = useButtonContext();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[
                numberOfLines !== 1 && styles.breakAll,
                isLoading && styles.opacity0,
                styles.pointerEventsNone,
                styles.buttonText,
                styles.flexShrink1,
                size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL && styles.buttonExtraSmallText,
                size === CONST.DROPDOWN_BUTTON_SIZE.SMALL && styles.buttonSmallText,
                size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM && styles.buttonMediumText,
                size === CONST.DROPDOWN_BUTTON_SIZE.LARGE && styles.buttonLargeText,
                variant === 'success' && styles.buttonSuccessText,
                variant === 'danger' && styles.buttonDangerText,
                variant === 'link' && [styles.fontWeightNormal, styles.fontSizeLabel, styles.link, isHovered && StyleUtils.getColorStyle(theme.linkHover)],
                isHovered && hoverStyle,
                style,
            ]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            {children}
        </Text>
    );
}

export default ButtonText;
export type {ButtonTextProps};
