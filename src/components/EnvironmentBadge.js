import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import borders from '../styles/utilities/borders';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

const EnvironmentBadge = () => {
    // If we are on production, don't show any badge
    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION) {
        return;
    }

    let badgeText = 'DEV';
    let style = styles.badgeDanger;

    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.STAGING) {
        badgeText = 'STG';
        style = styles.badgeSuccess;
    }

    return (
        <View
            style={[styles.badge, borders.brSmall, style, styles.ml2]}
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
