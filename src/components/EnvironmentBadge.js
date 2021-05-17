import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';

const propTypes = {
    ...environmentPropTypes,
};

class EnvironmentBadge extends React.Component {
    render() {
        // If we are on production, don't show any badge
        if (this.props.environment === CONST.ENVIRONMENT.PRODUCTION) {
            return null;
        }

        const backgroundColorStyle = this.props.environment === CONST.ENVIRONMENT.STAGING
            ? styles.badgeSuccess
            : styles.badgeDanger;

        return (
            <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
                <Text style={styles.badgeText}>
                    {this.props.environment}
                </Text>
            </View>
        );
    }
}

EnvironmentBadge.propTypes = propTypes;
export default withEnvironment(EnvironmentBadge);
