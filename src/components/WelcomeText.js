import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {

    // Fontsize
    textSize: PropTypes.oneOf(['default', 'large']),

    ...withLocalizePropTypes,
};

const defaultProps = {
    textSize: 'default',
};

const WelcomeText = (props) => {
    const {translations: {translate}} = props;
    return (
        <>
            <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel, styles.textStrong, styles.mb1]}>
                {translate('welcomeText')[0]}
            </Text>
            <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel]}>
                {translate('welcomeText')[1]}
                {' '}
                {translate('welcomeText')[2]}
            </Text>
        </>
    );
};

WelcomeText.displayName = 'WelcomeText';
WelcomeText.propTypes = propTypes;
WelcomeText.defaultProps = defaultProps;

export default withLocalize(WelcomeText);
