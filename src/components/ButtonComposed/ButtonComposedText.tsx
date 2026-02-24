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
    const {isLoading, success, danger, extraSmall, small, medium, large, link, isHovered} = useButtonComposedContext();
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
                extraSmall && styles.buttonExtraSmallText,
                small && styles.buttonSmallText,
                medium && styles.buttonMediumText,
                large && styles.buttonLargeText,
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
