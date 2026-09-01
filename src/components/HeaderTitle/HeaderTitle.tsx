import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import {View} from 'react-native';

import HeaderTitleSubtitle from './HeaderTitleSubtitle';
import HeaderTitleSubtitleLink from './HeaderTitleSubtitleLink';
import useHeaderDialogAnnouncement from './useHeaderDialogAnnouncement';

type HeaderProps = {
    /** Title of the Header */
    title?: string;

    /** Subtitle of the header */
    subtitle?: string;

    /** Additional text styles */
    textStyles?: StyleProp<TextStyle>;

    /** Additional header styles */
    style?: StyleProp<ViewStyle>;

    /** Additional header container styles */
    containerStyles?: StyleProp<ViewStyle>;

    /** The URL link associated with the attachment's subtitle, if available */
    subTitleLink?: string;

    /** Line number for the title */
    numberOfTitleLines?: number;

    /** The title to be used for the dialog (used for screen reader announcements). */
    dialogTitle?: string;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

function Header({
    title = '',
    subtitle = '',
    textStyles = [],
    style,
    containerStyles = [],
    subTitleLink = '',
    numberOfTitleLines = 2,
    dialogTitle,
    shouldSkipFocusAfterTransition = false,
}: HeaderProps) {
    const styles = useThemeStyles();

    useHeaderDialogAnnouncement(dialogTitle ?? title, shouldSkipFocusAfterTransition);

    return (
        <View style={[styles.flex1, styles.flexRow, containerStyles]}>
            <View style={[styles.mw100, style]}>
                <Text
                    numberOfLines={numberOfTitleLines}
                    style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, textStyles]}
                    accessibilityRole={CONST.ROLE.HEADER}
                    accessibilityLabel={title}
                >
                    {title}
                </Text>
                {!!subtitle && <HeaderTitleSubtitle>{subtitle}</HeaderTitleSubtitle>}
                {!!subTitleLink && <HeaderTitleSubtitleLink>{subTitleLink}</HeaderTitleSubtitleLink>}
            </View>
        </View>
    );
}

export default Header;

export type {HeaderProps};
