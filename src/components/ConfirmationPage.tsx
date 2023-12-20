import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';
import FixedFooter from './FixedFooter';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import DotLottieAnimation from './LottieAnimations/types';
import Text from './Text';

type ConfirmationPageProps = {
    /** The asset to render */
    animation?: DotLottieAnimation;

    /** Heading of the confirmation page */
    heading: string;

    /** Description of the confirmation page */
    description: string;

    /** The text for the button label */
    buttonText?: string;

    /** A function that is called when the button is clicked on */
    onButtonPress?: () => void;

    /** Whether we should show a confirmation button */
    shouldShowButton?: boolean;
};

function ConfirmationPage({animation = LottieAnimations.Fireworks, heading, description, buttonText = '', onButtonPress = () => {}, shouldShowButton = false}: ConfirmationPageProps) {
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
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{heading}</Text>
                <Text style={styles.textAlignCenter}>{description}</Text>
            </View>
            {shouldShowButton && (
                <FixedFooter>
                    <Button
                        success
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
