import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

type ConfirmationPageDescriptionProps = {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

function ConfirmationPageDescription({children, style}: ConfirmationPageDescriptionProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.textAlignCenter, style, styles.w100]}>{children}</Text>;
}

export default ConfirmationPageDescription;
