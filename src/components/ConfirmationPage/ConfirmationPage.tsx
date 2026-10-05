import FixedFooter from '@components/FixedFooter';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import isIllustrationLottieAnimation from '@libs/isIllustrationLottieAnimation';

import type {Errors} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import ConfirmationPageContent from './layout/Content';
import ConfirmationPagePrimaryButton from './primitives/ConfirmationPagePrimaryButton';
import ConfirmationPageSecondaryButton from './primitives/ConfirmationPageSecondaryButton';

type ConfirmationPageProps = {
    illustration?: DotLottieAnimation | IconAsset;
    heading: string;
    description?: React.ReactNode;
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

    /** Whether the primary confirmation button should be disabled */
    isButtonDisabled?: boolean;

    /** Whether the primary confirmation button should show a loading spinner */
    isButtonLoading?: boolean;

    /** The text for the secondary button label */
    secondaryButtonText?: string;

    onSecondaryButtonPress?: () => void;
    shouldShowSecondaryButton?: boolean;

    /** Whether the secondary confirmation button should be disabled */
    isSecondaryButtonDisabled?: boolean;

    /** Whether the secondary confirmation button should show a loading spinner */
    isSecondaryButtonLoading?: boolean;
    headingStyle?: TextStyle;

    /** Additional style for the animation */
    illustrationStyle?: StyleProp<ViewStyle>;

    descriptionStyle?: StyleProp<TextStyle>;
    ctaStyle?: TextStyle;
    footerStyle?: ViewStyle;

    /** Component rendered inside the footer, above the buttons (e.g. an inline error message) */
    requestErrors?: Errors | null;

    containerStyle?: ViewStyle;
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
    isButtonDisabled = false,
    isButtonLoading = false,
    secondaryButtonText = '',
    onSecondaryButtonPress = () => {},
    shouldShowSecondaryButton = false,
    isSecondaryButtonDisabled = false,
    isSecondaryButtonLoading = false,
    headingStyle,
    illustrationStyle,
    descriptionStyle,
    ctaStyle,
    footerStyle,
    requestErrors,
    containerStyle,
    innerContainerStyle,
}: ConfirmationPageProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Fireworks']);
    const isLottie = isIllustrationLottieAnimation(illustration);
    const shouldShowStaticFallback = isLottie && isReduceMotionEnabled && illustration === LottieAnimations.Fireworks;

    return (
        <View style={[styles.flex1, containerStyle]}>
            <ConfirmationPageContent
                style={innerContainerStyle}
                requestErrors={requestErrors}
            >
                {(() => {
                    if (shouldShowStaticFallback) {
                        return (
                            <View style={[styles.confirmationAnimation, illustrationStyle]}>
                                <ImageSVG
                                    src={illustrations.Fireworks}
                                    contentFit="contain"
                                />
                            </View>
                        );
                    }
                    if (isLottie) {
                        return (
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
                        );
                    }
                    return (
                        <View style={[styles.confirmationAnimation, illustrationStyle]}>
                            <ImageSVG
                                src={illustration}
                                contentFit="contain"
                            />
                        </View>
                    );
                })()}
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, headingStyle]}>{heading}</Text>
                {!!descriptionComponent && descriptionComponent}
                {!!description && <Text style={[styles.textAlignCenter, descriptionStyle, styles.w100]}>{description}</Text>}
                {cta ? <Text style={[styles.textAlignCenter, ctaStyle]}>{cta}</Text> : null}
                {!!ctaComponent && ctaComponent}
            </ConfirmationPageContent>
            {(shouldShowSecondaryButton || shouldShowButton) && (
                <FixedFooter style={footerStyle}>
                    {shouldShowSecondaryButton && (
                        <ConfirmationPageSecondaryButton
                            text={secondaryButtonText}
                            isDisabled={isSecondaryButtonDisabled}
                            isLoading={isSecondaryButtonLoading}
                            onPress={onSecondaryButtonPress}
                        />
                    )}
                    {shouldShowButton && (
                        <ConfirmationPagePrimaryButton
                            text={buttonText}
                            isDisabled={isButtonDisabled}
                            isLoading={isButtonLoading}
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
