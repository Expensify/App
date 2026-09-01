import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleTextProps = {
    children: string;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
};

function HeaderTitleText({children, style, numberOfLines = 2}: HeaderTitleTextProps) {
    const styles = useThemeStyles();

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, style]}
            accessibilityRole={CONST.ROLE.HEADER}
            accessibilityLabel={children}
        >
            {children}
        </Text>
    );
}

export default HeaderTitleText;
