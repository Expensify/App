import EnvironmentBadge from '@components/EnvironmentBadge';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useDialogContainerFocus from '@hooks/useDialogContainerFocus';
import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import {View} from 'react-native';

import HeaderTitleSubtitle from './HeaderTitleSubtitle';
import HeaderTitleSubtitleLink from './HeaderTitleSubtitleLink';
import HeaderTitleText from './HeaderTitleText';

type HeaderProps = {
    /** Title of the Header */
    title?: string;

    /** Subtitle of the header */
    subtitle?: string;

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge?: boolean;

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

    /** Whether this is the screen-level header (registers dialog label and focus). Only HeaderWithBackButton should set this. */
    isScreenHeader?: boolean;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

function Header({
    title = '',
    subtitle = '',
    textStyles = [],
    style,
    containerStyles = [],
    shouldShowEnvironmentBadge = false,
    subTitleLink = '',
    numberOfTitleLines = 2,
    isScreenHeader = false,
    shouldSkipFocusAfterTransition = false,
}: HeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isTransitionReady, claimInitialFocus, containerRef} = useDialogLabelRegistration(isScreenHeader ? title : '');

    useDialogContainerFocus(containerRef, isTransitionReady, claimInitialFocus, shouldSkipFocusAfterTransition);

    const dialogTitle = isScreenHeader && typeof title === 'string' ? title : '';
    const dialogAnnouncement = dialogTitle ? `${dialogTitle}, ${translate('common.dialogOpened')}` : '';
    // Polite so JAWS can finish the tab-title "(1) …" (left paren…) before "{title}, dialog" — assertive was cutting it off at "lef".
    // Keep announcing even when shouldSkipFocusAfterTransition is set — that flag only skips focus moves (e.g. New Task / IOU confirmation).
    // Web-only: iOS VoiceOver must not speak this (index.ios honors shouldAnnounceOnNative; default would announce).
    useAccessibilityAnnouncement(dialogAnnouncement, isTransitionReady && !!dialogTitle, {
        shouldAnnounceOnWeb: true,
        shouldAnnounceOnNative: false,
        politeness: 'polite',
    });

    return (
        <View style={[styles.flex1, styles.flexRow, containerStyles]}>
            <View style={[styles.mw100, style]}>
                <HeaderTitleText
                    numberOfLines={numberOfTitleLines}
                    style={textStyles}
                >
                    {title}
                </HeaderTitleText>
                <>
                    {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
                    {!!subtitle && <HeaderTitleSubtitle>{subtitle}</HeaderTitleSubtitle>}
                </>
                {!!subTitleLink && <HeaderTitleSubtitleLink>{subTitleLink}</HeaderTitleSubtitleLink>}
            </View>
            {shouldShowEnvironmentBadge && <EnvironmentBadge />}
        </View>
    );
}

export default Header;

export type {HeaderProps};
