import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {Linking, View} from 'react-native';
import useDialogContainerFocus from '@hooks/useDialogContainerFocus';
import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import EnvironmentBadge from './EnvironmentBadge';
import Text from './Text';
import TextLink from './TextLink';

type HeaderProps = {
    /** Title of the Header */
    title?: ReactNode;

    /** Subtitle of the header */
    subtitle?: ReactNode;

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
}: HeaderProps) {
    const styles = useThemeStyles();
    const {isTransitionReady, claimInitialFocus, containerRef} = useDialogLabelRegistration(isScreenHeader ? title : '');

    useDialogContainerFocus(containerRef, isTransitionReady, claimInitialFocus);

    const renderedSubtitle = useMemo(
        () => (
            <>
                {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
                {typeof subtitle === 'string'
                    ? !!subtitle && (
                          <Text
                              style={[styles.mutedTextLabel, styles.pre]}
                              numberOfLines={1}
                          >
                              {subtitle}
                          </Text>
                      )
                    : subtitle}
            </>
        ),
        [subtitle, styles],
    );

    const renderedSubTitleLink = useMemo(
        () => (
            <TextLink
                onPress={() => {
                    Linking.openURL(subTitleLink);
                }}
                numberOfLines={1}
                style={styles.label}
            >
                {subTitleLink}
            </TextLink>
        ),
        [styles.label, subTitleLink],
    );

    return (
        <View style={[styles.flex1, styles.flexRow, containerStyles]}>
            <View style={[styles.mw100, style]}>
                {typeof title === 'string'
                    ? !!title && (
                          <Text
                              numberOfLines={numberOfTitleLines}
                              style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, textStyles]}
                              accessibilityRole={CONST.ROLE.HEADER}
                              accessibilityLabel={title}
                          >
                              {title}
                          </Text>
                      )
                    : title}
                {renderedSubtitle}
                {!!subTitleLink && renderedSubTitleLink}
            </View>
            {shouldShowEnvironmentBadge && <EnvironmentBadge />}
        </View>
    );
}

export default Header;

export type {HeaderProps};
