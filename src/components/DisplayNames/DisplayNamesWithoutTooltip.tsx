import React from 'react';
import {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';

type DisplayNamesWithoutTooltipProps = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle?: string;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /** Number of lines before wrapping */
    numberOfLines?: number;
};

function DisplayNamesWithoutTooltip({textStyles = [], numberOfLines = 1, fullTitle = ''}: DisplayNamesWithoutTooltipProps) {
    const styles = useThemeStyles();
    return (
        <Text
            style={[textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
        >
            {fullTitle}
        </Text>
    );
}

DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';

export default DisplayNamesWithoutTooltip;
