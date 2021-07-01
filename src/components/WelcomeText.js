import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';

const propTypes = {

    /** Fontsize */
    textSize: PropTypes.oneOf(['default', 'large']),

    ...withLocalizePropTypes,
};

const defaultProps = {
    textSize: 'default',
};

const WelcomeText = props => (
    <>
        <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel, styles.textStrong, styles.mb1]}>
            {props.translate('welcomeText.phrase1')}
        </Text>
        <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel]}>
            {props.translate('welcomeText.phrase2')}
            {' '}
            {props.translate('welcomeText.phrase3')}
        </Text>
    </>
);

WelcomeText.displayName = 'WelcomeText';
WelcomeText.propTypes = propTypes;
WelcomeText.defaultProps = defaultProps;

export default withLocalize(WelcomeText);
