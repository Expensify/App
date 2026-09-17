import HeaderTitleComponent from '@components/HeaderTitle';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleTextProps = {
    /** Title of the header. */
    title: string;

    /** The color of the title text. */
    titleColor?: string;
    titleStyles?: StyleProp<TextStyle>;

    /** Whether to use the headline header style. */
    shouldUseHeadlineHeader?: boolean;
};

function HeaderTitleText({title, titleColor, titleStyles, shouldUseHeadlineHeader}: HeaderTitleTextProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <HeaderTitleComponent.Text
            numberOfLines={1}
            style={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2, titleStyles]}
        >
            {title}
        </HeaderTitleComponent.Text>
    );
}

export default HeaderTitleText;
