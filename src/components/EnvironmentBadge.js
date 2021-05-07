import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import Environment from '../libs/Environment';

const EnvironmentBadge = () => {
    const environment = Environment.getEnvironment();

    // If we are on production, don't show any badge
    if (environment === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    let backgroundColorStyle = styles.badgeDanger;
    if (environment === CONST.ENVIRONMENT.STAGING) {
        backgroundColorStyle = styles.badgeSuccess;
    }

    return (
        <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
            <Text style={styles.badgeText}>
                {environment}
            </Text>
        </View>
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
