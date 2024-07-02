import React from 'react';
import type {TextStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';
import FixedFooter from './FixedFooter';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import type DotLottieAnimation from './LottieAnimations/types';
import Text from './Text';

type ConfirmationPageProps = {
    /** The asset to render */
    animation?: DotLottieAnimation;

    /** Heading of the confirmation page */
    heading: string;

    /** Description of the confirmation page */
    description: React.ReactNode;

    /** The text for the button label */
    buttonText?: string;

    /** A function that is called when the button is clicked on */
    onButtonPress?: () => void;

    /** Whether we should show a confirmation button */
    shouldShowButton?: boolean;

    /** Additional style for the heading */
    headingStyle?: TextStyle;

    /** Additional style for the description */
    descriptionStyle?: TextStyle;
};

function ConfirmationPage({
    animation = LottieAnimations.Fireworks,
    heading,
    description,
    buttonText = '',
    onButtonPress = () => {},
    shouldShowButton = false,
    headingStyle,
    descriptionStyle,
}: ConfirmationPageProps) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                <Lottie
                    source={animation}
                    autoPlay
                    loop
                    style={styles.confirmationAnimation}
                />
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, headingStyle]}>{heading}</Text>
                <Text style={[styles.textAlignCenter, descriptionStyle]}>{description}</Text>
            </View>
            {shouldShowButton && (
                <FixedFooter>
                    <Button
                        success
                        large
                        text={buttonText}
                        style={styles.mt6}
                        pressOnEnter
                        onPress={onButtonPress}
                    />
                </FixedFooter>
            )}
        </>
    );
}

ConfirmationPage.displayName = 'ConfirmationPage';

export default ConfirmationPage;
