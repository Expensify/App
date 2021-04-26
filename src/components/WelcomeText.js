import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {

    // Fontsize
    textSize: PropTypes.oneOf(['default', 'large']),
};

const defaultProps = {
    textSize: 'default',
};

const WelcomeText = props => (
    <>
        <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel, styles.textStrong, styles.mb1]}>
            With Expensify.cash, chat and payments are the same thing.
        </Text>
        <Text style={[props.textSize === 'large' ? styles.textP : styles.textLabel]}>
            Money talks. And now that chat and payments are in one place, it&apos;s also easy.
            {' '}
            Your payments get to you as fast as you can get your point across.
        </Text>
    </>
);

WelcomeText.displayName = 'WelcomeText';
WelcomeText.propTypes = propTypes;
WelcomeText.defaultProps = defaultProps;

export default WelcomeText;
