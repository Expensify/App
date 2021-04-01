import React from 'react';
import {Text} from 'react-native';
import styles from '../styles/styles';

const WelcomeText = props => (
    <>
        <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP, styles.textStrong, styles.mb1]}>
            With Expensify.cash, chat and payments are the same thing.
        </Text>
        <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP]}>
            Money talks. And now that chat and payments are in one place, it&apos;s also easy.
            {' '}
            Your payments get to you as fast as you can get your point across.
        </Text>
    </>
);

WelcomeText.displayName = 'WelcomeText';

export default WelcomeText;
