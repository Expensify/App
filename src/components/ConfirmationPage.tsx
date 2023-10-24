import React from 'react';
import {View} from 'react-native';
import {AnimationObject} from 'lottie-react-native';
import Lottie from './Lottie';
import * as LottieAnimations from './LottieAnimations';
import Text from './Text';
import styles from '../styles/styles';
import Button from './Button';
import FixedFooter from './FixedFooter';

type ConfirmationPageProps = {
    /** The asset to render */
    animation: string | AnimationObject | {uri: string};

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

function ConfirmationPage({
    animation = LottieAnimations.Fireworks,
    heading = '',
    description = '',
    buttonText = '',
    onButtonPress = () => {},
    shouldShowButton = false,
}: ConfirmationPageProps) {
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
