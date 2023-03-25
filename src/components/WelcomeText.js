import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';

const propTypes = {

    /** Fontsize */
    smallFontSize: PropTypes.bool,

    /** Header Style Text */
    welcomeHeader: PropTypes.string,

    /**  Body Style Text */
    welcomeBody: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    smallFontSize: false,
    welcomeHeader: '',
    welcomeBody: '',
};

const WelcomeText = (props) => {
    const textSize = props.smallFontSize ? styles.textLabel : undefined;
    return (
        <>
            <Text style={[textSize, styles.textStrong, styles.mb1]}>
                {props.welcomeHeader}
                {/* {props.translate('welcomeText.welcome')} */}
            </Text>
            <Text style={[textSize]}>
                {props.welcomeBody}
                {props.translate('welcomeText.phrase2')}
                {' '}
                {props.translate('welcomeText.phrase3')}
            </Text>
        </>
    );
};

WelcomeText.displayName = 'WelcomeText';
WelcomeText.propTypes = propTypes;
WelcomeText.defaultProps = defaultProps;

export default withLocalize(WelcomeText);
