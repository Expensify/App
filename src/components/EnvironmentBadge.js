import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

const EnvironmentBadge = () => {
    // If we are on production, don't show any badge
    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    const badgeText = CONFIG.EXPENSIFY.ENVIRONMENT;
    let backgroundColorStyle = styles.badgeDanger;

    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.STAGING) {
        backgroundColorStyle = styles.badgeSuccess;
    }

    return (
        <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
            <Text style={styles.badgeText}>
                {badgeText}
            </Text>
        </View>
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
