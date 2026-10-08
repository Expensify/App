import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

type ConfirmationPageHeadingProps = {
    children: string;
    style?: StyleProp<TextStyle>;
};

function ConfirmationPageHeading({children, style}: ConfirmationPageHeadingProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, style]}>{children}</Text>;
}

export default ConfirmationPageHeading;
