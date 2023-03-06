import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Lottie from 'lottie-react-native';
import FireworksAnimation from '../../assets/animations/Fireworks.json';
import Text from './Text';
import styles from '../styles/styles';
import Button from './Button';
import FixedFooter from './FixedFooter';

const propTypes = {
    /** The asset to render */
    animation: PropTypes.string,

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
    animation: FireworksAnimation,
    heading: '',
    description: '',
    buttonText: '',
    onButtonPress: () => {},
    shouldShowButton: false,
};

const ConfirmationPage = props => (
    <>
        <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
            <Lottie
                source={props.animation}
                autoPlay
                loop
                style={styles.confirmationAnimation}
            />
            <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>
                {props.heading}
            </Text>
            <Text style={styles.textAlignCenter}>
                {props.description}
            </Text>
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

ConfirmationPage.propTypes = propTypes;
ConfirmationPage.defaultProps = defaultProps;
ConfirmationPage.displayName = 'ConfirmationPage';

export default ConfirmationPage;
