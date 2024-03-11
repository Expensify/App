import React from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle, WebStyle} from 'react-native';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import AutoEmailLink from '@components/AutoEmailLink';
import Icon from '@components/Icon';
import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';

type RequiredIllustrationProps =
    | {
          /** Expensicon for the page */
          icon: React.FC<SvgProps> | ImageSourcePropType;

          /**
           * Animation for the page
           * If icon is provided, animation is not required
           */
          animation?: DotLottieAnimation;
      }
    | {
          /** Animation for the page */
          animation: DotLottieAnimation;

          /**
           * Expensicon for the page
           * If animation is provided, icon is not required
           */
          icon?: React.FC<SvgProps> | ImageSourcePropType;
      };

type BlockingViewProps = RequiredIllustrationProps & {
    /** Color for the icon (should be from theme) */
    iconColor?: string;

    /** Title message below the icon */
    title: string;

    /** Subtitle message below the title */
    subtitle?: string;

    /** Link message below the subtitle */
    linkKey?: TranslationPaths;

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink?: boolean;

    /** The custom icon width */
    iconWidth?: number;

    /** The custom icon height */
    iconHeight?: number;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Whether we should embed the link with subtitle */
    shouldEmbedLinkWithSubtitle?: boolean;

    /** Style for the animation */
    animationStyles?: StyleProp<ViewStyle>;

    /** Style for the animation on web */
    animationWebStyle?: WebStyle;

    /** Render custom subtitle */
    renderCustomSubtitle?: () => React.ReactElement;
};

function BlockingView({
    animation,
    icon,
    iconColor,
    title,
    subtitle = '',
    linkKey = 'notFound.goBackHome',
    shouldShowLink = false,
    iconWidth = variables.iconSizeSuperLarge,
    iconHeight = variables.iconSizeSuperLarge,
    onLinkPress = () => Navigation.dismissModal(),
    shouldEmbedLinkWithSubtitle = false,
    animationStyles = [],
    animationWebStyle = {},
    renderCustomSubtitle,
}: BlockingViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    function renderContent() {
        return (
            <>
                <AutoEmailLink
                    style={[styles.textAlignCenter]}
                    text={subtitle}
                />
                {shouldShowLink ? (
                    <TextLink
                        onPress={onLinkPress}
                        style={[styles.link, styles.mt2]}
                    >
                        {translate(linkKey)}
                    </TextLink>
                ) : null}
            </>
        );
    }

    function renderSubtitle() {
        if (renderCustomSubtitle) {
            return renderCustomSubtitle();
        }
        return shouldEmbedLinkWithSubtitle ? (
            <Text style={[styles.textAlignCenter]}>{renderContent()}</Text>
        ) : (
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{renderContent()}</View>
        );
    }

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
            {animation && (
                <Lottie
                    source={animation}
                    loop
                    autoPlay
                    style={animationStyles}
                    webStyle={animationWebStyle}
                />
            )}
            {icon && (
                <Icon
                    src={icon}
                    fill={iconColor}
                    width={iconWidth}
                    height={iconHeight}
                />
            )}
            <View>
                <Text style={[styles.notFoundTextHeader]}>{title}</Text>

                {renderSubtitle()}
            </View>
        </View>
    );
}

BlockingView.displayName = 'BlockingView';

export default BlockingView;
