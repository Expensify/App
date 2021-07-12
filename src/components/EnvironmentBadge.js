import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import Text from './Text';
import withEnvironment, {environmentPropTypes} from './withEnvironment';

const EnvironmentBadge = (props) => {
    // If we are on production, don't show any badge
    if (props.environment === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    const backgroundColorStyle = props.environment === CONST.ENVIRONMENT.STAGING
        ? styles.badgeSuccess
        : styles.badgeDanger;

    return (
        <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
            <Text style={styles.badgeText}>
                {props.environment}
            </Text>
        </View>
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
EnvironmentBadge.propTypes = environmentPropTypes;
export default withEnvironment(EnvironmentBadge);
