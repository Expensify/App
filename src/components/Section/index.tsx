import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {MenuItemWithLink} from '@components/MenuItemList';
import MenuItemList from '@components/MenuItemList';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import isIllustrationLottieAnimation from '@libs/isIllustrationLottieAnimation';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import IconSection from './IconSection';

const CARD_LAYOUT = {
    ICON_ON_TOP: 'iconOnTop',
    ICON_ON_LEFT: 'iconOnLeft',
    ICON_ON_RIGHT: 'iconOnRight',
} as const;

type SectionProps = Partial<ChildrenProps> & {
    /** An array of props that are passed to individual MenuItem components */
    menuItems?: MenuItemWithLink[];

    /** The text to display in the title of the section */
    title?: string;

    /** The text to display in the subtitle of the section */
    subtitle?: string;

    /** The icon to display along with the title */
    icon?: IconAsset;

    /** Card layout that affects icon positioning, margins, sizes */
    cardLayout?: ValueOf<typeof CARD_LAYOUT>;

    /** Whether the subtitle should have a muted style */
    subtitleMuted?: boolean;

    /** Customize the Section container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Customize the Section title */
    titleStyles?: StyleProp<TextStyle>;

    /** Customize the Section container */
    subtitleStyles?: StyleProp<ViewStyle>;

    /** Customize the Section subtitle text */
    subtitleTextStyles?: StyleProp<TextStyle>;

    /** Customize the Section container */
    childrenStyles?: StyleProp<ViewStyle>;

    /** Customize the Icon container */
    iconContainerStyles?: StyleProp<ViewStyle>;

    /** Whether the section is in the central pane of the layout */
    isCentralPane?: boolean;

    /** The illustration to display in the header. Can be an image or a JSON object representing a Lottie animation. */
    illustration?: DotLottieAnimation | IconAsset;

    /** The background color to apply in the upper half of the screen. */
    illustrationBackgroundColor?: string;

    /** Customize the Illustration container */
    illustrationContainerStyle?: StyleProp<ViewStyle>;

    /** Styles to apply to illustration component */
    illustrationStyle?: StyleProp<ViewStyle>;

    /** Padding for content on large screens */
    contentPaddingOnLargeScreens?: {padding: number};

    /** Overlay content to display on top of animation */
    overlayContent?: () => ReactNode;

    /** The component to display in the title of the section */
    renderSubtitle?: () => ReactNode;

    /** The component to display custom title */
    renderTitle?: () => ReactNode;

    /** The width of the icon. */
    iconWidth?: number;

    /** The height of the icon. */
    iconHeight?: number;

    /** Banner to display at the top of the section */
    banner?: ReactNode;
};

function Section({
    children,
    childrenStyles,
    containerStyles,
    icon,
    cardLayout = CARD_LAYOUT.ICON_ON_RIGHT,
    iconContainerStyles,
    menuItems,
    subtitle,
    subtitleStyles,
    subtitleTextStyles,
    subtitleMuted = false,
    title,
    renderTitle,
    titleStyles,
    isCentralPane = false,
    illustration,
    illustrationBackgroundColor,
    illustrationContainerStyle,
    illustrationStyle,
    contentPaddingOnLargeScreens,
    overlayContent,
    iconWidth,
    iconHeight,
    renderSubtitle,
    banner = null,
}: SectionProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();

    const isLottie = isIllustrationLottieAnimation(illustration);

    const lottieIllustration = isLottie ? illustration : undefined;
    return (
        <View style={[styles.pageWrapper, styles.cardSectionContainer, containerStyles, (isCentralPane || !!illustration) && styles.p0]}>
            {banner}
            {cardLayout === CARD_LAYOUT.ICON_ON_TOP && (
                <IconSection
                    width={iconWidth}
                    height={iconHeight}
                    icon={icon}
                    iconContainerStyles={[iconContainerStyles, styles.alignSelfStart, styles.mb3]}
                />
            )}
            {!!illustration && (
                <View
                    style={[
                        styles.w100,
                        styles.dFlex,
                        styles.alignItemsCenter,
                        styles.justifyContentCenter,
                        StyleUtils.getBackgroundColorStyle(illustrationBackgroundColor ?? lottieIllustration?.backgroundColor ?? theme.appBG),
                        illustrationContainerStyle,
                    ]}
                >
                    {!isReduceMotionEnabled && (
                        <View style={[styles.cardSectionIllustration, illustrationStyle]}>
                            {isLottie ? (
                                <Lottie
                                    source={illustration}
                                    style={styles.h100}
                                    webStyle={styles.h100}
                                    autoPlay
                                    loop
                                    shouldLoadAfterInteractions={shouldUseNarrowLayout}
                                />
                            ) : (
                                <ImageSVG
                                    src={illustration}
                                    contentFit="contain"
                                />
                            )}
                        </View>
                    )}
                    {overlayContent?.()}
                </View>
            )}
            <View style={[styles.w100, isCentralPane && (shouldUseNarrowLayout ? styles.p5 : (contentPaddingOnLargeScreens ?? styles.p8))]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP && styles.mh1]}>
                    {cardLayout === CARD_LAYOUT.ICON_ON_LEFT && (
                        <IconSection
                            width={iconWidth}
                            height={iconHeight}
                            icon={icon}
                            iconContainerStyles={[styles.flexGrow0, styles.justifyContentStart, iconContainerStyles]}
                        />
                    )}
                    <View style={[styles.flexShrink1, styles.w100]}>
                        {renderTitle ? renderTitle() : !!title && <Text style={[styles.textHeadline, styles.cardSectionTitle, titleStyles]}>{title}</Text>}
                    </View>
                    {cardLayout === CARD_LAYOUT.ICON_ON_RIGHT && (
                        <IconSection
                            width={iconWidth}
                            height={iconHeight}
                            icon={icon}
                            iconContainerStyles={iconContainerStyles}
                        />
                    )}
                </View>

                {renderSubtitle
                    ? renderSubtitle?.()
                    : !!subtitle && (
                          <View
                              style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP ? [styles.mt1, styles.mh1] : styles.mt2, subtitleStyles]}
                          >
                              <Text style={[styles.textNormal, subtitleMuted && styles.colorMuted, subtitleTextStyles]}>{subtitle}</Text>
                          </View>
                      )}

                <View style={[styles.w100, childrenStyles]}>{children}</View>

                <View style={[styles.w100]}>{!!menuItems && <MenuItemList menuItems={menuItems} />}</View>
            </View>
        </View>
    );
}

export type {SectionProps};
export {CARD_LAYOUT};
export default Section;
