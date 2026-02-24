import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useButtonComposedContext} from './ButtonComposedContext';

type ButtonComposedTextProps = {
    /** The text to display */
    children: string;

    /** The number of lines to display */
    numberOfLines?: number;

    /** Additional text styles */
    style?: StyleProp<TextStyle>;
};

function ButtonComposedText({children, numberOfLines = 1, style}: ButtonComposedTextProps) {
    const {isLoading, success, danger, size, link, isHovered} = useButtonComposedContext();
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
                size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL && styles.buttonExtraSmallText,
                size === CONST.DROPDOWN_BUTTON_SIZE.SMALL && styles.buttonSmallText,
                size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM && styles.buttonMediumText,
                size === CONST.DROPDOWN_BUTTON_SIZE.LARGE && styles.buttonLargeText,
                success && styles.buttonSuccessText,
                danger && styles.buttonDangerText,
                link && styles.fontWeightNormal,
                link && styles.fontSizeLabel,
                link && styles.link,
                link && isHovered && StyleUtils.getColorStyle(theme.linkHover),
                style,
            ]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            {children}
        </Text>
    );
}

export default ButtonComposedText;
export type {ButtonComposedTextProps};
