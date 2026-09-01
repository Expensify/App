import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleSubtitleLinkProps = {
    children: string;
    numberOfLines?: number;
    style?: StyleProp<TextStyle>;
};

function HeaderTitleSubtitleLink({children, numberOfLines = 2, style}: HeaderTitleSubtitleLinkProps) {
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

export default HeaderTitleSubtitleLink;
