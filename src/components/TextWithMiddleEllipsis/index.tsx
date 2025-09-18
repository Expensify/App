import React, {useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useTextWithMiddleEllipsis from '@hooks/useTextWithMiddleEllipsis';
import useThemeStyles from '@hooks/useThemeStyles';

type TextWithMiddleEllipsisProps = {
    /** The text to display */
    text: string;

    /** Additional styles */
    style?: StyleProp<ViewStyle>;

    /** Additional text styles */
    textStyle?: StyleProp<TextStyle>;
};

function TextWithMiddleEllipsis({text, style, textStyle}: TextWithMiddleEllipsisProps) {
    const styles = useThemeStyles();

    const ref = useRef<RNText>(null);

    const displayText = useTextWithMiddleEllipsis({
        text,
        ref,
    });

    return (
        <View style={[style, styles.flexShrink1, styles.textWithMiddleEllipsisContainer]}>
            <Text
                style={[textStyle, styles.textWithMiddleEllipsisText]}
                numberOfLines={1}
                ref={ref}
            >
                {displayText}
            </Text>
        </View>
    );
}

export default TextWithMiddleEllipsis;
