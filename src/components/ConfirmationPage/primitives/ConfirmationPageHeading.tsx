import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

function ConfirmationPageHeading({children, style}: {children: string; style?: StyleProp<TextStyle>}) {
    const styles = useThemeStyles();

    return <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, style]}>{children}</Text>;
}

export default ConfirmationPageHeading;
