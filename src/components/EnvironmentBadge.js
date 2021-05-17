import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import withEnvironment from './withEnvironment';

class EnvironmentBadge extends React.Component {
    render() {
        // If we are on production, don't show any badge
        if (this.state.environment === CONST.ENVIRONMENT.PRODUCTION) {
            return null;
        }

        const backgroundColorStyle = this.state.environment === CONST.ENVIRONMENT.STAGING
            ? styles.badgeSuccess
            : styles.badgeDanger;

        return (
            <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
                <Text style={styles.badgeText}>
                    {this.state.environment}
                </Text>
            </View>
        );
    }
}

export default withEnvironment(EnvironmentBadge);
