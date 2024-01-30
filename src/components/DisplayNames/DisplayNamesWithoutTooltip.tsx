import React from 'react';
import type {ComponentType} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type DisplayNamesWithoutTooltipProps = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle?: string;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /** Number of lines before wrapping */
    numberOfLines?: number;

    /** Additional component to render after the text */
    AdditionalComponent?: ComponentType;
};

function DisplayNamesWithoutTooltip({textStyles = [], numberOfLines = 1, fullTitle = '', AdditionalComponent}: DisplayNamesWithoutTooltipProps) {
    const styles = useThemeStyles();
    return (
        <Text
            style={[textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
        >
            {fullTitle}
            {AdditionalComponent && <AdditionalComponent />}
        </Text>
    );
}

DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';

export default DisplayNamesWithoutTooltip;
