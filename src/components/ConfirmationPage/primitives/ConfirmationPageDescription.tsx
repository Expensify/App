import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

function ConfirmationPageDescription({children, style}: {children: React.ReactNode; style?: StyleProp<TextStyle>}) {
    const styles = useThemeStyles();

    return <Text style={[styles.textAlignCenter, style, styles.w100]}>{children}</Text>;
}

export default ConfirmationPageDescription;
