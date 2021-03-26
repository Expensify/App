import React from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    isSmallScreenWidth: PropTypes.bool.isRequired,
};

const WelcomeText = props => (
    <View style={props.isSmallScreenWidth ? [] : [styles.mb6, styles.mt6]}>
        <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP, styles.textStrong, styles.mb1]}>
            With Expensify.cash, chat and payments are the same thing.
        </Text>
        <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP]}>
            Money talks. And now that chat and payments are in one place, it&apos;s also easy.
            {' '}
            Your payments get to you as fast as you can get your point across.
        </Text>
    </View>
);

WelcomeText.propTypes = propTypes;
WelcomeText.displayName = 'WelcomeText';

export default withWindowDimensions(WelcomeText);
