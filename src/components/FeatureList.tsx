import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';
import type DotLottieAnimation from './LottieAnimations/types';
import MenuItem from './MenuItem';
import Section from './Section';

type FeatureListItem = {
    icon: IconAsset;
    translationKey: TranslationPaths;
};

type FeatureListProps = {
    /** The text to display in the title of the section */
    title: string;

    /** The text to display in the subtitle of the section */
    subtitle?: string;

    /** Text of the call to action button */
    ctaText?: string;

    /** Accessibility label for the call to action button */
    ctaAccessibilityLabel?: string;

    /** Action to call on cta button press */
    onCtaPress?: () => void;

    /** Text of the secondary button button */
    secondaryButtonText?: string;

    /** Accessibility label for the secondary button */
    secondaryButtonAccessibilityLabel?: string;

    /** Action to call on secondary button press */
    onSecondaryButtonPress?: () => void;

    /** A list of menuItems representing the feature list. */
    menuItems: FeatureListItem[];

    /** The illustration to display in the header. Can be an image or a JSON object representing a Lottie animation. */
    illustration: DotLottieAnimation | IconAsset;

    /** The style passed to the illustration */
    illustrationStyle?: StyleProp<ViewStyle>;

    /** The background color to apply in the upper half of the screen. */
    illustrationBackgroundColor?: string;

    /** Customize the Illustration container */
    illustrationContainerStyle?: StyleProp<ViewStyle>;

    /** The style used for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** The error message to display for the CTA button */
    ctaErrorMessage?: string;

    /** Padding for content on large screens */
    contentPaddingOnLargeScreens?: {padding: number};
};

function FeatureList({
    title,
    subtitle = '',
    ctaText = '',
    ctaAccessibilityLabel = '',
    onCtaPress = () => {},
    secondaryButtonText = '',
    secondaryButtonAccessibilityLabel = '',
    onSecondaryButtonPress = () => {},
    ctaErrorMessage,
    menuItems,
    illustration,
    illustrationStyle,
    illustrationBackgroundColor,
    illustrationContainerStyle,
    titleStyles,
    contentPaddingOnLargeScreens,
}: FeatureListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={title}
            subtitle={subtitle}
            isCentralPane
            subtitleMuted
            illustration={illustration}
            illustrationBackgroundColor={illustrationBackgroundColor}
            illustrationStyle={illustrationStyle}
            titleStyles={titleStyles}
            illustrationContainerStyle={illustrationContainerStyle}
            contentPaddingOnLargeScreens={contentPaddingOnLargeScreens}
        >
            <View style={styles.flex1}>
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pv4, styles.pl1]}>
                    {menuItems.map(({translationKey, icon}) => (
                        <View
                            key={translationKey}
                            style={styles.w100}
                        >
                            <MenuItem
                                title={translate(translationKey)}
                                icon={icon}
                                iconWidth={variables.menuIconSize}
                                iconHeight={variables.menuIconSize}
                                interactive={false}
                                displayInDefaultIconColor
                                wrapperStyle={[styles.p0, styles.cursorAuto]}
                                containerStyle={[styles.m0, styles.wAuto]}
                                numberOfLinesTitle={0}
                            />
                        </View>
                    ))}
                </View>
                {!!secondaryButtonText && (
                    <Button
                        text={secondaryButtonText}
                        onPress={onSecondaryButtonPress}
                        accessibilityLabel={secondaryButtonAccessibilityLabel}
                        style={[styles.w100, styles.mb3]}
                        large
                    />
                )}
                {ctaErrorMessage && (
                    <DotIndicatorMessage
                        style={styles.mb1}
                        messages={{error: ctaErrorMessage}}
                        type="error"
                    />
                )}
                <Button
                    text={ctaText}
                    onPress={onCtaPress}
                    accessibilityLabel={ctaAccessibilityLabel}
                    style={styles.w100}
                    success
                    large
                />
            </View>
        </Section>
    );
}

FeatureList.displayName = 'FeatureList';

export default FeatureList;
export type {FeatureListItem};
