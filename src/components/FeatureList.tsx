import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
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

    /** A list of menuItems representing the feature list. */
    menuItems: FeatureListItem[];

    /** The illustration to display in the header. Can be a JSON object representing a Lottie animation. */
    illustration: DotLottieAnimation;

    /** The style passed to the illustration */
    illustrationStyle?: StyleProp<ViewStyle>;

    /** The background color to apply in the upper half of the screen. */
    illustrationBackgroundColor?: string;

    /** The style used for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Padding for content on large screens */
    contentPaddingOnLargeScreens?: {padding: number};
};

function FeatureList({
    title,
    subtitle = '',
    ctaText = '',
    ctaAccessibilityLabel = '',
    onCtaPress,
    menuItems,
    illustration,
    illustrationStyle,
    illustrationBackgroundColor,
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
                            />
                        </View>
                    ))}
                </View>
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
