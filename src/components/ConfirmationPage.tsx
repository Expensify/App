import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import isIllustrationLottieAnimation from '@libs/isIllustrationLottieAnimation';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import FixedFooter from './FixedFooter';
import ImageSVG from './ImageSVG';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import type DotLottieAnimation from './LottieAnimations/types';
import Text from './Text';

type ConfirmationPageProps = {
    /** The asset to render */
    illustration?: DotLottieAnimation | IconAsset;

    /** Heading of the confirmation page */
    heading: string;

    /** Description of the confirmation page */
    description?: React.ReactNode;

    /** Description component of the confirmation page */
    descriptionComponent?: React.ReactNode;

    /** The text for the call to action */
    cta?: React.ReactNode;

    /** Call to action component of the confirmation page */
    ctaComponent?: React.ReactNode;

    /** The text for the primary button label */
    buttonText?: string;

    /** A function that is called when the primary button is clicked on */
    onButtonPress?: () => void;

    /** Whether we should show a primary confirmation button */
    shouldShowButton?: boolean;

    /** The text for the secondary button label */
    secondaryButtonText?: string;

    /** A function that is called when the secondary button is clicked on */
    onSecondaryButtonPress?: () => void;

    /** Whether we should show a secondary confirmation button */
    shouldShowSecondaryButton?: boolean;

    /** Additional style for the heading */
    headingStyle?: TextStyle;

    /** Additional style for the animation */
    illustrationStyle?: StyleProp<ViewStyle>;

    /** Additional style for the description */
    descriptionStyle?: StyleProp<TextStyle>;

    /** Additional style for the cta */
    ctaStyle?: TextStyle;

    /** Additional style for the footer */
    footerStyle?: ViewStyle;

    /** Additional style for the container */
    containerStyle?: ViewStyle;

    /** Additional style for the inner container */
    innerContainerStyle?: ViewStyle;
};

function ConfirmationPage({
    illustration = LottieAnimations.Fireworks,
    heading,
    description,
    descriptionComponent,
    cta,
    ctaComponent,
    buttonText = '',
    onButtonPress = () => {},
    shouldShowButton = false,
    secondaryButtonText = '',
    onSecondaryButtonPress = () => {},
    shouldShowSecondaryButton = false,
    headingStyle,
    illustrationStyle,
    descriptionStyle,
    ctaStyle,
    footerStyle,
    containerStyle,
    innerContainerStyle,
}: ConfirmationPageProps) {
    const styles = useThemeStyles();
    const isLottie = isIllustrationLottieAnimation(illustration);

    return (
        <View style={[styles.flex1, containerStyle]}>
            <View style={[styles.screenCenteredContainer, styles.alignItemsCenter, innerContainerStyle]}>
                {isLottie ? (
                    <Lottie
                        source={illustration}
                        autoPlay
                        loop
                        style={[styles.confirmationAnimation, illustrationStyle]}
                        webStyle={{
                            width: (StyleSheet.flatten(illustrationStyle)?.width as number) ?? styles.confirmationAnimation.width,
                            height: (StyleSheet.flatten(illustrationStyle)?.height as number) ?? styles.confirmationAnimation.height,
                        }}
                    />
                ) : (
                    <View style={[styles.confirmationAnimation, illustrationStyle]}>
                        <ImageSVG
                            src={illustration}
                            contentFit="contain"
                        />
                    </View>
                )}
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, headingStyle]}>{heading}</Text>
                {!!descriptionComponent && descriptionComponent}
                {!!description && <Text style={[styles.textAlignCenter, descriptionStyle, styles.w100]}>{description}</Text>}
                {cta ? <Text style={[styles.textAlignCenter, ctaStyle]}>{cta}</Text> : null}
                {!!ctaComponent && ctaComponent}
            </View>
            {(shouldShowSecondaryButton || shouldShowButton) && (
                <FixedFooter style={footerStyle}>
                    {shouldShowSecondaryButton && (
                        <Button
                            large
                            text={secondaryButtonText}
                            testID="confirmation-secondary-button"
                            style={styles.mt3}
                            onPress={onSecondaryButtonPress}
                        />
                    )}
                    {shouldShowButton && (
                        <Button
                            success
                            large
                            text={buttonText}
                            testID="confirmation-primary-button"
                            style={styles.mt3}
                            pressOnEnter
                            onPress={onButtonPress}
                        />
                    )}
                </FixedFooter>
            )}
        </View>
    );
}

export default ConfirmationPage;

export type {ConfirmationPageProps};
