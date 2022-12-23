import React from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import Button from './Button';
import FixedFooter from './FixedFooter';
import CONST from '../CONST';

const propTypes = {
    /** The asset to render */
    illustration: PropTypes.string,

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
    illustration: `${CONST.CLOUDFRONT_URL}/images/animations/animation__fireworks.gif`,
    heading: '',
    description: '',
    buttonText: '',
    onButtonPress: () => {},
    shouldShowButton: false,
};

const ConfirmationPage = props => (
    <>
        <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
            <Image
                source={{uri: props.illustration}}
                style={styles.confirmationAnimation}
            />
            <Text
                style={[
                    styles.textStrong,
                    styles.textXLarge,
                    styles.headlineFont,
                    styles.mv2,
                ]}
            >
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
