import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

const EnvironmentBadge = () => {
    // If we are on production, don't show any badge
    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION) {
        return;
    }

    const badgeText = CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.STAGING ? 'STG' : 'DEV';
    return (
        <View
            style={[styles.badge, styles.badgeSuccess, styles.ml2]}
        >
            <Text
                style={styles.badgeText}
                numberOfLines={1}
            >
                {badgeText}
            </Text>
        </View>
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
