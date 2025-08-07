import type {ImageContentFit} from 'expo-image';
import React, {useMemo} from 'react';
import type {ImageSourcePropType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import type {WebStyle} from 'react-native-web';
import type {MergeExclusive} from 'type-fest';
import Icon from '@components/Icon';
import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import SubtitleDefault from './SubtitleDefault';
import SubtitleWithBelowLink from './SubtitleWithBelowLink';

type BaseBlockingViewProps = {
    /** Title message below the icon */
    title: string;

    /** Subtitle message below the title */
    subtitle?: string;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Link message below the subtitle */
    linkKey?: TranslationPaths;

    /** Message below the link message */
    subtitleKeyBelowLink?: TranslationPaths | '';

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Whether we should embed the link with subtitle */
    shouldEmbedLinkWithSubtitle?: boolean;

    /** Render custom subtitle */
    CustomSubtitle?: React.ReactElement;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** Additional styles to apply to the container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to add bottom safe area padding to the view. */
    addBottomSafeAreaPadding?: boolean;

    /** Accessibility label for the view */
    accessibilityLabel?: string;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;

    /** A testing ID that can be applied to the element on the page */
    testID?: string;
};

type BlockingViewIconProps = {
    /** Expensicon for the page */
    icon: React.FC<SvgProps> | ImageSourcePropType;

    /** The custom icon width */
    iconWidth?: number;

    /** The custom icon height */
    iconHeight?: number;

    /** Color for the icon (should be from theme) */
    iconColor?: string;
};

type BlockingViewAnimationProps = {
    /** Animation for the page */
    animation: DotLottieAnimation;

    /** Style for the animation */
    animationStyles?: StyleProp<ViewStyle>;

    /** Style for the animation on web */
    animationWebStyle?: WebStyle;
};

// This page requires either an icon or an animation, but not both
type BlockingViewProps = BaseBlockingViewProps & MergeExclusive<BlockingViewIconProps, BlockingViewAnimationProps>;

function BlockingView({
    animation,
    icon,
    iconColor,
    title,
    subtitle = '',
    subtitleStyle,
    linkKey,
    subtitleKeyBelowLink,
    iconWidth = variables.iconSizeSuperLarge,
    iconHeight = variables.iconSizeSuperLarge,
    onLinkPress = () => Navigation.dismissModal(),
    shouldEmbedLinkWithSubtitle = false,
    animationStyles = [],
    animationWebStyle = {},
    accessibilityLabel = '',
    CustomSubtitle,
    contentFitImage,
    containerStyle: containerStyleProp,
    addBottomSafeAreaPadding,
    addOfflineIndicatorBottomSafeAreaPadding,
    testID,
}: BlockingViewProps) {
    const styles = useThemeStyles();
    const SubtitleWrapper = shouldEmbedLinkWithSubtitle ? Text : View;
    const subtitleWrapperStyle = useMemo(
        () => (shouldEmbedLinkWithSubtitle ? [styles.textAlignCenter] : [styles.alignItemsCenter, styles.justifyContentCenter]),
        [shouldEmbedLinkWithSubtitle, styles],
    );
    const containerStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, style: containerStyleProp});

    return (
        <View
            style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10, containerStyle]}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
        >
            {!!animation && (
                <Lottie
                    source={animation}
                    loop
                    autoPlay
                    style={animationStyles}
                    webStyle={animationWebStyle}
                />
            )}
            {!!icon && (
                <Icon
                    src={icon}
                    fill={iconColor}
                    width={iconWidth}
                    height={iconHeight}
                    contentFit={contentFitImage}
                />
            )}
            <View>
                <Text style={[styles.notFoundTextHeader]}>{title}</Text>

                {!!CustomSubtitle && CustomSubtitle}
                {!CustomSubtitle && (
                    <SubtitleWrapper style={subtitleWrapperStyle}>
                        {!!subtitleKeyBelowLink && !!linkKey ? (
                            <SubtitleWithBelowLink
                                subtitle={subtitle}
                                subtitleStyle={subtitleStyle}
                                subtitleKeyBelowLink={subtitleKeyBelowLink}
                                onLinkPress={onLinkPress}
                                linkKey={linkKey}
                            />
                        ) : (
                            <SubtitleDefault
                                subtitle={subtitle}
                                subtitleStyle={subtitleStyle}
                                onLinkPress={onLinkPress}
                                linkKey={linkKey}
                            />
                        )}
                    </SubtitleWrapper>
                )}
            </View>
        </View>
    );
}

BlockingView.displayName = 'BlockingView';

export default BlockingView;
