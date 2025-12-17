import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import Text from './Text';

type TextPillProps = {
    /** The color of the text/ */
    color?: string;

    /** Styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;

    children: React.ReactNode;
};

function TextPill({color, textStyles, children}: TextPillProps) {
    const styles = useThemeStyles();
    return (
        <Text style={[{backgroundColor: color ?? colors.red, borderRadius: 6}, styles.overflowHidden, styles.textStrong, styles.ph2, styles.pv1, styles.flexShrink0, textStyles]}>
            {children}
        </Text>
    );
}

export default TextPill;
