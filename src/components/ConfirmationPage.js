import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import Button from './Button';
import FixedFooter from './FixedFooter';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Text from './Text';

const propTypes = {
    /** The asset to render */
    // eslint-disable-next-line react/forbid-prop-types
    animation: PropTypes.object,

    /** Heading of the confirmation page */
    heading: PropTypes.string,

    /** Description of the confirmation page */
    description: PropTypes.string,

    /** The text for the button label */
    buttonText: PropTypes.string,

    /** A function that is called when the button is clicked on */
    onButtonPress: PropTypes.func,

    /** Whether we should show a confirmation button */
    shouldShowButton: PropTypes.bool,
};

const defaultProps = {
    animation: LottieAnimations.Fireworks,
    heading: '',
    description: '',
    buttonText: '',
    onButtonPress: () => {},
    shouldShowButton: false,
};

function ConfirmationPage(props) {
    const styles = useThemeStyles();
    return (
        <>
            <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                <Lottie
                    source={props.animation}
                    autoPlay
                    loop
                    style={styles.confirmationAnimation}
                    webStyle={styles.confirmationAnimationWeb}
                />
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{props.heading}</Text>
                <Text style={styles.textAlignCenter}>{props.description}</Text>
            </View>
            {props.shouldShowButton && (
                <FixedFooter>
                    <Button
                        success
                        text={props.buttonText}
                        style={styles.mt6}
                        pressOnEnter
                        onPress={props.onButtonPress}
                    />
                </FixedFooter>
            )}
        </>
    );
}

ConfirmationPage.propTypes = propTypes;
ConfirmationPage.defaultProps = defaultProps;
ConfirmationPage.displayName = 'ConfirmationPage';

export default ConfirmationPage;
