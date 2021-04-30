import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

const defaultProps = {
    environment: CONST.ENVIRONMENT.PRODUCTION,
};

const propTypes = {
    environment: PropTypes.string,
};

const EnvironmentBadge = (props) => {
    // If we are on production, don't show any badge
    if (props.environment === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    let backgroundColorStyle = styles.badgeDanger;
    if (props.environment === CONST.ENVIRONMENT.STAGING) {
        backgroundColorStyle = styles.badgeSuccess;
    }

    return (
        <View style={[styles.badge, backgroundColorStyle, styles.ml2]}>
            <Text style={styles.badgeText}>
                {props.environment}
            </Text>
        </View>
    );
};

EnvironmentBadge.propTypes = propTypes;
EnvironmentBadge.displayName = 'EnvironmentBadge';
EnvironmentBadge.defaultProps = defaultProps;
export default withOnyx({
    environment: {
        key: ONYXKEYS.ENVIRONMENT,
    },
})(EnvironmentBadge);
